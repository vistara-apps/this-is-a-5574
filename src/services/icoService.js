import apiService from './apiService.js';
import contractService from './contractService.js';
import { utils } from '../utils/blockchain.js';

class ICOService {
  constructor() {
    this.apiService = apiService;
    this.contractService = contractService;
  }

  // Create a new ICO project
  async createICO(icoData, walletAccount) {
    try {
      // Initialize contract service with wallet
      this.contractService.initializeWalletClient(walletAccount);

      // Step 1: Create ICO record in database
      const projectData = {
        ...icoData,
        creatorAddress: walletAccount.address,
        status: 'Draft',
        totalRaised: 0,
        investors: 0,
        progress: 0,
        createdAt: new Date().toISOString()
      };

      const createdProject = await this.apiService.createICOProject(projectData);

      // Step 2: Deploy smart contract
      const contractResult = await this.contractService.createICO(icoData);

      // Step 3: Update project with contract address
      const updatedProject = await this.apiService.updateICOProject(
        createdProject.projectId,
        {
          contractAddress: contractResult.icoAddress,
          deploymentTxHash: contractResult.transactionHash,
          status: 'Active'
        }
      );

      return {
        success: true,
        project: updatedProject,
        contractResult
      };

    } catch (error) {
      console.error('ICO creation failed:', error);
      throw this.handleError(error);
    }
  }

  // Get ICO project details
  async getICOProject(projectId, includeBlockchainData = true) {
    try {
      // Get project from database
      const project = await this.apiService.getICOProject(projectId);

      if (includeBlockchainData && project.contractAddress) {
        // Get real-time data from blockchain
        const blockchainData = await this.contractService.getICODetails(project.contractAddress);
        
        // Merge database and blockchain data
        return {
          ...project,
          ...blockchainData,
          // Keep database values for fields that might be more accurate
          projectName: project.projectName,
          createdAt: project.createdAt,
          creatorAddress: project.creatorAddress
        };
      }

      return project;

    } catch (error) {
      console.error('Failed to get ICO project:', error);
      throw this.handleError(error);
    }
  }

  // Get all ICO projects for a user
  async getUserICOProjects(walletAddress, filters = {}) {
    try {
      const projects = await this.apiService.getICOProjects({
        creatorAddress: walletAddress,
        ...filters
      });

      // Optionally enrich with blockchain data
      if (filters.includeBlockchainData) {
        const enrichedProjects = await Promise.all(
          projects.map(async (project) => {
            if (project.contractAddress) {
              try {
                const blockchainData = await this.contractService.getICODetails(project.contractAddress);
                return { ...project, ...blockchainData };
              } catch (error) {
                console.warn(`Failed to get blockchain data for project ${project.projectId}:`, error);
                return project;
              }
            }
            return project;
          })
        );
        return enrichedProjects;
      }

      return projects;

    } catch (error) {
      console.error('Failed to get user ICO projects:', error);
      throw this.handleError(error);
    }
  }

  // Update ICO project
  async updateICOProject(projectId, updateData) {
    try {
      return await this.apiService.updateICOProject(projectId, updateData);
    } catch (error) {
      console.error('Failed to update ICO project:', error);
      throw this.handleError(error);
    }
  }

  // Make a contribution to an ICO
  async contributeToICO(projectId, contributionData, walletAccount) {
    try {
      // Initialize contract service with wallet
      this.contractService.initializeWalletClient(walletAccount);

      // Get project details
      const project = await this.getICOProject(projectId, false);
      
      if (!project.contractAddress) {
        throw new Error('ICO contract not deployed');
      }

      const { amount, currency, stakingTier } = contributionData;

      // Step 1: Execute blockchain transaction
      const contractResult = await this.contractService.contribute(
        project.contractAddress,
        amount,
        currency,
        stakingTier
      );

      // Step 2: Record contribution in database
      const contributionRecord = {
        projectId,
        investorAddress: walletAccount.address,
        amount: parseFloat(amount),
        currency,
        stakingTier,
        transactionHash: contractResult.transactionHash,
        blockNumber: contractResult.receipt.blockNumber,
        timestamp: new Date().toISOString(),
        status: 'Confirmed'
      };

      await this.apiService.recordContribution(projectId, contributionRecord);

      // Step 3: Update project statistics
      await this.updateProjectStats(projectId);

      return {
        success: true,
        transactionHash: contractResult.transactionHash,
        contribution: contributionRecord
      };

    } catch (error) {
      console.error('Contribution failed:', error);
      throw this.handleError(error);
    }
  }

  // Get investors for an ICO
  async getICOInvestors(projectId, includeBlockchainData = false) {
    try {
      if (includeBlockchainData) {
        // Get project to find contract address
        const project = await this.getICOProject(projectId, false);
        
        if (project.contractAddress) {
          // Get investors from blockchain
          const blockchainInvestors = await this.contractService.getInvestors(project.contractAddress);
          
          // Enrich with database data if available
          const dbInvestors = await this.apiService.getInvestors(projectId);
          
          return this.mergeInvestorData(blockchainInvestors, dbInvestors);
        }
      }

      // Get investors from database only
      return await this.apiService.getInvestors(projectId);

    } catch (error) {
      console.error('Failed to get ICO investors:', error);
      throw this.handleError(error);
    }
  }

  // Finalize an ICO
  async finalizeICO(projectId, walletAccount) {
    try {
      // Initialize contract service with wallet
      this.contractService.initializeWalletClient(walletAccount);

      // Get project details
      const project = await this.getICOProject(projectId, true);
      
      if (!project.contractAddress) {
        throw new Error('ICO contract not deployed');
      }

      // Check if ICO can be finalized
      if (project.status !== 'Ended' && project.status !== 'Active') {
        throw new Error('ICO cannot be finalized in current status');
      }

      // Execute blockchain finalization
      const contractResult = await this.contractService.finalizeICO(project.contractAddress);

      // Update project status in database
      await this.apiService.updateICOProject(projectId, {
        status: 'Finalized',
        finalizedAt: new Date().toISOString(),
        finalizationTxHash: contractResult.transactionHash
      });

      return {
        success: true,
        transactionHash: contractResult.transactionHash
      };

    } catch (error) {
      console.error('ICO finalization failed:', error);
      throw this.handleError(error);
    }
  }

  // Cancel an ICO and refund contributors
  async cancelICO(projectId, walletAccount) {
    try {
      // Initialize contract service with wallet
      this.contractService.initializeWalletClient(walletAccount);

      // Get project details
      const project = await this.getICOProject(projectId, true);
      
      if (!project.contractAddress) {
        throw new Error('ICO contract not deployed');
      }

      // Execute blockchain refund
      const contractResult = await this.contractService.refundContributors(project.contractAddress);

      // Update project status in database
      await this.apiService.updateICOProject(projectId, {
        status: 'Cancelled',
        cancelledAt: new Date().toISOString(),
        refundTxHash: contractResult.transactionHash
      });

      return {
        success: true,
        transactionHash: contractResult.transactionHash
      };

    } catch (error) {
      console.error('ICO cancellation failed:', error);
      throw this.handleError(error);
    }
  }

  // Get ICO analytics
  async getICOAnalytics(projectId, timeframe = '7d') {
    try {
      const analytics = await this.apiService.getICOAnalytics(projectId, timeframe);
      return analytics;
    } catch (error) {
      console.error('Failed to get ICO analytics:', error);
      throw this.handleError(error);
    }
  }

  // Get fundraising chart data
  async getFundraisingChart(projectId, timeframe = '7d') {
    try {
      const chartData = await this.apiService.getFundraisingChart(projectId, timeframe);
      return chartData;
    } catch (error) {
      console.error('Failed to get fundraising chart:', error);
      throw this.handleError(error);
    }
  }

  // Get tier breakdown
  async getTierBreakdown(projectId) {
    try {
      const tierData = await this.apiService.getTierBreakdown(projectId);
      return tierData;
    } catch (error) {
      console.error('Failed to get tier breakdown:', error);
      throw this.handleError(error);
    }
  }

  // Private helper methods
  async updateProjectStats(projectId) {
    try {
      // Get all contributions for the project
      const contributions = await this.apiService.getContributions(projectId);
      
      // Calculate statistics
      const totalRaised = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
      const uniqueInvestors = new Set(contributions.map(contrib => contrib.investorAddress)).size;
      
      // Get project to calculate progress
      const project = await this.apiService.getICOProject(projectId);
      const progress = utils.calculatePercentage(totalRaised, project.hardCap);

      // Update project statistics
      await this.apiService.updateICOProject(projectId, {
        totalRaised,
        investors: uniqueInvestors,
        progress
      });

    } catch (error) {
      console.error('Failed to update project stats:', error);
      // Don't throw error as this is a background operation
    }
  }

  mergeInvestorData(blockchainInvestors, dbInvestors) {
    // Create a map of database investors by wallet address
    const dbInvestorMap = new Map(
      dbInvestors.map(investor => [investor.walletAddress.toLowerCase(), investor])
    );

    // Merge blockchain data with database data
    return blockchainInvestors.map(blockchainInvestor => {
      const dbInvestor = dbInvestorMap.get(blockchainInvestor.walletAddress.toLowerCase());
      
      return {
        ...blockchainInvestor,
        ...dbInvestor, // Database data takes precedence for additional fields
        // Keep blockchain data for critical fields
        contributionAmount: blockchainInvestor.contributionAmount,
        contributionCurrency: blockchainInvestor.contributionCurrency,
        stakingTier: blockchainInvestor.stakingTier
      };
    });
  }

  handleError(error) {
    if (error.type) {
      // Already a formatted error
      return error;
    }

    return {
      type: 'ICO_SERVICE_ERROR',
      message: error.message || 'An ICO service error occurred',
      details: error
    };
  }
}

// Create singleton instance
const icoService = new ICOService();

export default icoService;
