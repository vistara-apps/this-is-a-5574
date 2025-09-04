import { createPublicClientForNetwork, createWalletClientForNetwork, utils, CURRENCIES, ICO_STATUS, STAKING_TIERS, BLOCKCHAIN_ERRORS, gasUtils, transactionUtils } from '../utils/blockchain.js';
import ICOContractABI from '../contracts/ICOContract.json';

class ContractService {
  constructor() {
    this.contractAddress = ICOContractABI.contractAddress;
    this.abi = ICOContractABI.abi;
    this.publicClient = createPublicClientForNetwork();
  }

  // Initialize wallet client with user's account
  initializeWalletClient(account) {
    this.walletClient = createWalletClientForNetwork(account);
    this.account = account;
  }

  // Create a new ICO smart contract
  async createICO(icoData) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const {
        projectName,
        tokenSymbol,
        totalTokensForSale,
        saleStartDate,
        saleEndDate,
        minContribution,
        maxContribution,
        softCap,
        hardCap
      } = icoData;

      // Convert dates to timestamps
      const saleStartTime = utils.dateToTimestamp(saleStartDate);
      const saleEndTime = utils.dateToTimestamp(saleEndDate);

      // Convert amounts to Wei
      const totalSupply = utils.toWei(totalTokensForSale);
      const minContrib = utils.toWei(minContribution);
      const maxContrib = utils.toWei(maxContribution);
      const softCapWei = utils.toWei(softCap);
      const hardCapWei = utils.toWei(hardCap);

      // Prepare transaction
      const transaction = {
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'createICO',
        args: [
          projectName,
          tokenSymbol,
          totalSupply,
          saleStartTime,
          saleEndTime,
          minContrib,
          maxContrib,
          softCapWei,
          hardCapWei
        ],
        account: this.account
      };

      // Estimate gas
      const gasEstimate = await gasUtils.estimateGas(this.publicClient, transaction);
      
      // Execute transaction
      const hash = await this.walletClient.writeContract({
        ...transaction,
        gas: gasEstimate
      });

      // Wait for confirmation
      const receipt = await transactionUtils.waitForTransaction(this.publicClient, hash);
      
      // Extract ICO address from logs
      const icoCreatedEvent = receipt.logs.find(log => 
        log.topics[0] === '0x...' // ICOCreated event signature
      );
      
      const icoAddress = icoCreatedEvent ? icoCreatedEvent.topics[1] : null;

      return {
        success: true,
        transactionHash: hash,
        icoAddress,
        receipt
      };

    } catch (error) {
      console.error('ICO creation failed:', error);
      throw this.handleContractError(error);
    }
  }

  // Make a contribution to an ICO
  async contribute(icoAddress, amount, currency, stakingTier) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = utils.toWei(amount);
      const currencyType = CURRENCIES[currency.toUpperCase()];
      const tierType = STAKING_TIERS[stakingTier.toUpperCase()];

      const transaction = {
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'contribute',
        args: [icoAddress, amountWei, currencyType, tierType],
        account: this.account,
        value: currency === 'ETH' ? amountWei : 0n
      };

      const gasEstimate = await gasUtils.estimateGas(this.publicClient, transaction);
      
      const hash = await this.walletClient.writeContract({
        ...transaction,
        gas: gasEstimate
      });

      const receipt = await transactionUtils.waitForTransaction(this.publicClient, hash);

      return {
        success: true,
        transactionHash: hash,
        receipt
      };

    } catch (error) {
      console.error('Contribution failed:', error);
      throw this.handleContractError(error);
    }
  }

  // Get ICO details from the blockchain
  async getICODetails(icoAddress) {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getICODetails',
        args: [icoAddress]
      });

      const [
        tokenName,
        tokenSymbol,
        totalRaised,
        softCap,
        hardCap,
        saleStartTime,
        saleEndTime,
        status
      ] = result;

      return {
        tokenName,
        tokenSymbol,
        totalRaised: utils.fromWei(totalRaised),
        softCap: utils.fromWei(softCap),
        hardCap: utils.fromWei(hardCap),
        saleStartDate: utils.timestampToDate(saleStartTime),
        saleEndDate: utils.timestampToDate(saleEndTime),
        status: this.getStatusName(status),
        progress: utils.calculatePercentage(
          parseFloat(utils.fromWei(totalRaised)),
          parseFloat(utils.fromWei(hardCap))
        )
      };

    } catch (error) {
      console.error('Failed to get ICO details:', error);
      throw this.handleContractError(error);
    }
  }

  // Get investors for an ICO
  async getInvestors(icoAddress) {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getInvestors',
        args: [icoAddress]
      });

      const [addresses, contributions, currencies, stakingTiers] = result;

      return addresses.map((address, index) => ({
        investorId: `${address}-${index}`,
        walletAddress: address,
        contributionAmount: parseFloat(utils.fromWei(contributions[index])),
        contributionCurrency: this.getCurrencyName(currencies[index]),
        stakingTier: this.getStakingTierName(stakingTiers[index]),
        contributionDate: new Date().toISOString().split('T')[0] // Placeholder
      }));

    } catch (error) {
      console.error('Failed to get investors:', error);
      throw this.handleContractError(error);
    }
  }

  // Finalize an ICO (for successful ICOs)
  async finalizeICO(icoAddress) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = {
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'finalizeICO',
        args: [icoAddress],
        account: this.account
      };

      const gasEstimate = await gasUtils.estimateGas(this.publicClient, transaction);
      
      const hash = await this.walletClient.writeContract({
        ...transaction,
        gas: gasEstimate
      });

      const receipt = await transactionUtils.waitForTransaction(this.publicClient, hash);

      return {
        success: true,
        transactionHash: hash,
        receipt
      };

    } catch (error) {
      console.error('ICO finalization failed:', error);
      throw this.handleContractError(error);
    }
  }

  // Refund contributors (for failed ICOs)
  async refundContributors(icoAddress) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = {
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'refundContributors',
        args: [icoAddress],
        account: this.account
      };

      const gasEstimate = await gasUtils.estimateGas(this.publicClient, transaction);
      
      const hash = await this.walletClient.writeContract({
        ...transaction,
        gas: gasEstimate
      });

      const receipt = await transactionUtils.waitForTransaction(this.publicClient, hash);

      return {
        success: true,
        transactionHash: hash,
        receipt
      };

    } catch (error) {
      console.error('Refund failed:', error);
      throw this.handleContractError(error);
    }
  }

  // Listen to contract events
  watchContractEvents(eventName, callback) {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: this.abi,
      eventName,
      onLogs: callback
    });
  }

  // Helper methods
  getStatusName(statusCode) {
    const statusNames = ['Draft', 'Active', 'Ended', 'Cancelled', 'Finalized'];
    return statusNames[statusCode] || 'Unknown';
  }

  getCurrencyName(currencyCode) {
    const currencyNames = ['ETH', 'USDC', 'SOL'];
    return currencyNames[currencyCode] || 'Unknown';
  }

  getStakingTierName(tierCode) {
    const tierNames = ['7-Day', '30-Day', '90-Day'];
    return tierNames[tierCode] || 'Unknown';
  }

  handleContractError(error) {
    if (error.message.includes('User rejected')) {
      return new Error(BLOCKCHAIN_ERRORS.USER_REJECTED);
    }
    if (error.message.includes('insufficient funds')) {
      return new Error(BLOCKCHAIN_ERRORS.INSUFFICIENT_FUNDS);
    }
    if (error.message.includes('network')) {
      return new Error(BLOCKCHAIN_ERRORS.NETWORK_ERROR);
    }
    return new Error(BLOCKCHAIN_ERRORS.CONTRACT_ERROR);
  }
}

// Create singleton instance
const contractService = new ContractService();

export default contractService;
