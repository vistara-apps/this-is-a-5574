import apiService from './apiService.js';
import contractService from './contractService.js';
import { utils } from '../utils/blockchain.js';

// Staking tier configurations
const STAKING_TIERS = {
  '7-day': {
    id: '7-day',
    name: '7-Day Lock',
    lockDurationDays: 7,
    rewardPercentage: 5,
    minimumInvestment: 100,
    description: 'Short-term commitment with basic rewards',
    icon: '⚡'
  },
  '30-day': {
    id: '30-day',
    name: '30-Day Lock',
    lockDurationDays: 30,
    rewardPercentage: 12,
    minimumInvestment: 500,
    description: 'Medium-term commitment with enhanced rewards',
    icon: '🚀'
  },
  '90-day': {
    id: '90-day',
    name: '90-Day Lock',
    lockDurationDays: 90,
    rewardPercentage: 25,
    minimumInvestment: 1000,
    description: 'Long-term commitment with maximum rewards',
    icon: '💎'
  }
};

class StakingService {
  constructor() {
    this.apiService = apiService;
    this.contractService = contractService;
    this.stakingTiers = STAKING_TIERS;
  }

  // Get all available staking tiers
  getStakingTiers() {
    return Object.values(this.stakingTiers);
  }

  // Get specific staking tier
  getStakingTier(tierId) {
    return this.stakingTiers[tierId] || null;
  }

  // Validate if investment amount meets tier requirements
  validateTierRequirement(tierId, amount) {
    const tier = this.getStakingTier(tierId);
    if (!tier) {
      throw new Error(`Invalid staking tier: ${tierId}`);
    }

    const investmentAmount = parseFloat(amount);
    if (investmentAmount < tier.minimumInvestment) {
      return {
        valid: false,
        required: tier.minimumInvestment,
        current: investmentAmount,
        shortfall: tier.minimumInvestment - investmentAmount
      };
    }

    return {
      valid: true,
      tier,
      amount: investmentAmount
    };
  }

  // Calculate staking rewards
  calculateStakingRewards(amount, tierId, daysStaked = null) {
    const tier = this.getStakingTier(tierId);
    if (!tier) {
      throw new Error(`Invalid staking tier: ${tierId}`);
    }

    const principal = parseFloat(amount);
    const annualRewardRate = tier.rewardPercentage / 100;
    
    // Calculate rewards based on actual days staked or tier duration
    const stakingDays = daysStaked || tier.lockDurationDays;
    const dailyRewardRate = annualRewardRate / 365;
    const totalRewards = principal * dailyRewardRate * stakingDays;

    return {
      principal,
      rewardRate: tier.rewardPercentage,
      stakingDays,
      totalRewards,
      finalAmount: principal + totalRewards,
      dailyRewards: totalRewards / stakingDays,
      tier
    };
  }

  // Get user's staking positions
  async getUserStakingPositions(walletAddress) {
    try {
      const stakingPositions = await this.apiService.getStakingRewards(walletAddress);
      
      // Enrich with tier information and calculate current rewards
      return stakingPositions.map(position => {
        const tier = this.getStakingTier(position.tierId);
        const daysStaked = this.calculateDaysStaked(position.stakingStartDate);
        const rewardCalculation = this.calculateStakingRewards(
          position.stakedAmount,
          position.tierId,
          Math.min(daysStaked, tier.lockDurationDays)
        );

        return {
          ...position,
          tier,
          daysStaked,
          daysRemaining: Math.max(0, tier.lockDurationDays - daysStaked),
          currentRewards: rewardCalculation.totalRewards,
          isUnlocked: daysStaked >= tier.lockDurationDays,
          canClaim: daysStaked >= tier.lockDurationDays && !position.claimed,
          rewardCalculation
        };
      });

    } catch (error) {
      console.error('Failed to get user staking positions:', error);
      throw this.handleError(error);
    }
  }

  // Stake tokens in a specific tier
  async stakeTokens(amount, tierId, walletAccount) {
    try {
      // Validate tier requirements
      const validation = this.validateTierRequirement(tierId, amount);
      if (!validation.valid) {
        throw new Error(`Minimum investment for ${tierId} tier is ${validation.required}`);
      }

      // Initialize contract service
      this.contractService.initializeWalletClient(walletAccount);

      // Create staking position in database
      const stakingData = {
        walletAddress: walletAccount.address,
        tierId,
        stakedAmount: parseFloat(amount),
        stakingStartDate: new Date().toISOString(),
        lockEndDate: this.calculateLockEndDate(tierId),
        status: 'Active',
        claimed: false
      };

      const stakingPosition = await this.apiService.post('/staking/positions', stakingData);

      return {
        success: true,
        stakingPosition,
        tier: validation.tier,
        rewardCalculation: this.calculateStakingRewards(amount, tierId)
      };

    } catch (error) {
      console.error('Staking failed:', error);
      throw this.handleError(error);
    }
  }

  // Claim staking rewards
  async claimStakingRewards(stakingPositionId, walletAccount) {
    try {
      // Initialize contract service
      this.contractService.initializeWalletClient(walletAccount);

      // Get staking position details
      const position = await this.apiService.get(`/staking/positions/${stakingPositionId}`);
      
      if (!position) {
        throw new Error('Staking position not found');
      }

      if (position.claimed) {
        throw new Error('Rewards already claimed');
      }

      const tier = this.getStakingTier(position.tierId);
      const daysStaked = this.calculateDaysStaked(position.stakingStartDate);

      if (daysStaked < tier.lockDurationDays) {
        throw new Error(`Lock period not completed. ${tier.lockDurationDays - daysStaked} days remaining`);
      }

      // Calculate final rewards
      const rewardCalculation = this.calculateStakingRewards(
        position.stakedAmount,
        position.tierId,
        tier.lockDurationDays
      );

      // Execute claim through API (which should handle blockchain interaction)
      const claimResult = await this.apiService.claimStakingRewards(walletAccount.address);

      // Update position status
      await this.apiService.put(`/staking/positions/${stakingPositionId}`, {
        status: 'Completed',
        claimed: true,
        claimDate: new Date().toISOString(),
        claimTxHash: claimResult.transactionHash,
        finalRewards: rewardCalculation.totalRewards
      });

      return {
        success: true,
        transactionHash: claimResult.transactionHash,
        rewardsClaimed: rewardCalculation.totalRewards,
        totalAmount: rewardCalculation.finalAmount,
        position
      };

    } catch (error) {
      console.error('Claim rewards failed:', error);
      throw this.handleError(error);
    }
  }

  // Get staking statistics for a user
  async getUserStakingStats(walletAddress) {
    try {
      const positions = await this.getUserStakingPositions(walletAddress);

      const stats = {
        totalStaked: 0,
        totalRewards: 0,
        activePositions: 0,
        completedPositions: 0,
        claimableRewards: 0,
        tierBreakdown: {}
      };

      positions.forEach(position => {
        stats.totalStaked += position.stakedAmount;
        stats.totalRewards += position.currentRewards;

        if (position.status === 'Active') {
          stats.activePositions++;
        } else if (position.status === 'Completed') {
          stats.completedPositions++;
        }

        if (position.canClaim) {
          stats.claimableRewards += position.currentRewards;
        }

        // Tier breakdown
        if (!stats.tierBreakdown[position.tierId]) {
          stats.tierBreakdown[position.tierId] = {
            count: 0,
            totalStaked: 0,
            totalRewards: 0
          };
        }

        stats.tierBreakdown[position.tierId].count++;
        stats.tierBreakdown[position.tierId].totalStaked += position.stakedAmount;
        stats.tierBreakdown[position.tierId].totalRewards += position.currentRewards;
      });

      return {
        ...stats,
        positions,
        totalPositions: positions.length
      };

    } catch (error) {
      console.error('Failed to get staking stats:', error);
      throw this.handleError(error);
    }
  }

  // Get global staking statistics
  async getGlobalStakingStats() {
    try {
      const stats = await this.apiService.get('/staking/global-stats');
      return stats;
    } catch (error) {
      console.error('Failed to get global staking stats:', error);
      throw this.handleError(error);
    }
  }

  // Get tier-specific analytics
  async getTierAnalytics(tierId) {
    try {
      const analytics = await this.apiService.get(`/staking/tiers/${tierId}/analytics`);
      const tier = this.getStakingTier(tierId);

      return {
        ...analytics,
        tier,
        averageRewardRate: tier.rewardPercentage,
        lockDuration: tier.lockDurationDays
      };
    } catch (error) {
      console.error('Failed to get tier analytics:', error);
      throw this.handleError(error);
    }
  }

  // Helper methods
  calculateDaysStaked(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateLockEndDate(tierId) {
    const tier = this.getStakingTier(tierId);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + tier.lockDurationDays);
    return endDate.toISOString();
  }

  formatStakingDuration(days) {
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      let result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        result += ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
      }
      return result;
    } else {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      let result = `${months} month${months !== 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        result += ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
      }
      return result;
    }
  }

  formatRewardPercentage(percentage) {
    return `${percentage}% APY`;
  }

  formatCurrency(amount, currency = 'PUMP') {
    return `${parseFloat(amount).toLocaleString()} ${currency}`;
  }

  handleError(error) {
    if (error.type) {
      return error;
    }

    return {
      type: 'STAKING_SERVICE_ERROR',
      message: error.message || 'A staking service error occurred',
      details: error
    };
  }
}

// Create singleton instance
const stakingService = new StakingService();

export default stakingService;
