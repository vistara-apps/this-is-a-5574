import { createPublicClientForNetwork, createWalletClientForNetwork, utils, CURRENCIES, BLOCKCHAIN_ERRORS } from '../utils/blockchain.js';
import contractService from './contractService.js';

// USDC Contract ABI (simplified)
const USDC_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  mainnet: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base mainnet USDC
  },
  testnet: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base testnet USDC
  }
};

class PaymentService {
  constructor() {
    this.publicClient = createPublicClientForNetwork();
    this.walletClient = null;
    this.account = null;
    
    // Get contract addresses for current network
    const isProduction = import.meta.env.PROD;
    this.contractAddresses = isProduction ? CONTRACT_ADDRESSES.mainnet : CONTRACT_ADDRESSES.testnet;
  }

  // Initialize wallet client
  initializeWallet(account) {
    this.walletClient = createWalletClientForNetwork(account);
    this.account = account;
    contractService.initializeWalletClient(account);
  }

  // Check if wallet is connected
  isWalletConnected() {
    return !!(this.walletClient && this.account);
  }

  // Get wallet balance for different currencies
  async getBalance(currency = 'ETH') {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    try {
      switch (currency.toUpperCase()) {
        case 'ETH':
          const ethBalance = await this.publicClient.getBalance({
            address: this.account.address
          });
          return {
            balance: utils.fromWei(ethBalance),
            currency: 'ETH',
            formatted: `${parseFloat(utils.fromWei(ethBalance)).toFixed(4)} ETH`
          };

        case 'USDC':
          const usdcBalance = await this.publicClient.readContract({
            address: this.contractAddresses.USDC,
            abi: USDC_ABI,
            functionName: 'balanceOf',
            args: [this.account.address]
          });
          
          // USDC has 6 decimals
          const usdcAmount = Number(usdcBalance) / 1e6;
          return {
            balance: usdcAmount,
            currency: 'USDC',
            formatted: `${usdcAmount.toFixed(2)} USDC`
          };

        default:
          throw new Error(`Unsupported currency: ${currency}`);
      }
    } catch (error) {
      console.error(`Failed to get ${currency} balance:`, error);
      throw new Error(`Failed to get ${currency} balance`);
    }
  }

  // Check if user has sufficient balance for a transaction
  async checkSufficientBalance(amount, currency) {
    try {
      const balance = await this.getBalance(currency);
      const requiredAmount = parseFloat(amount);
      
      if (balance.balance < requiredAmount) {
        return {
          sufficient: false,
          balance: balance.balance,
          required: requiredAmount,
          shortfall: requiredAmount - balance.balance
        };
      }

      return {
        sufficient: true,
        balance: balance.balance,
        required: requiredAmount
      };
    } catch (error) {
      console.error('Failed to check balance:', error);
      throw error;
    }
  }

  // Approve USDC spending (required before USDC contributions)
  async approveUSDC(spenderAddress, amount) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6)); // USDC has 6 decimals

      const hash = await this.walletClient.writeContract({
        address: this.contractAddresses.USDC,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [spenderAddress, amountWei],
        account: this.account
      });

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        receipt
      };

    } catch (error) {
      console.error('USDC approval failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  // Check USDC allowance
  async checkUSDCAllowance(spenderAddress) {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const allowance = await this.publicClient.readContract({
        address: this.contractAddresses.USDC,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [this.account.address, spenderAddress]
      });

      return Number(allowance) / 1e6; // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to check USDC allowance:', error);
      throw error;
    }
  }

  // Process a contribution payment
  async processContribution(icoAddress, amount, currency, stakingTier) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      // Step 1: Validate inputs
      this.validateContributionInputs(amount, currency, stakingTier);

      // Step 2: Check sufficient balance
      const balanceCheck = await this.checkSufficientBalance(amount, currency);
      if (!balanceCheck.sufficient) {
        throw new Error(`Insufficient ${currency} balance. Required: ${balanceCheck.required}, Available: ${balanceCheck.balance}`);
      }

      // Step 3: Handle USDC approval if needed
      if (currency.toUpperCase() === 'USDC') {
        const currentAllowance = await this.checkUSDCAllowance(contractService.contractAddress);
        const requiredAmount = parseFloat(amount);

        if (currentAllowance < requiredAmount) {
          // Need to approve USDC spending
          const approvalResult = await this.approveUSDC(contractService.contractAddress, amount);
          console.log('USDC approved:', approvalResult.transactionHash);
        }
      }

      // Step 4: Execute the contribution through contract service
      const contributionResult = await contractService.contribute(
        icoAddress,
        amount,
        currency,
        stakingTier
      );

      return {
        success: true,
        transactionHash: contributionResult.transactionHash,
        receipt: contributionResult.receipt,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        stakingTier
      };

    } catch (error) {
      console.error('Contribution payment failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  // Estimate gas costs for a transaction
  async estimateTransactionCost(icoAddress, amount, currency, stakingTier) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get current gas price
      const gasPrice = await this.publicClient.getGasPrice();

      // Estimate gas for the contribution transaction
      const amountWei = utils.toWei(amount);
      const currencyType = CURRENCIES[currency.toUpperCase()];
      const tierType = this.getStakingTierType(stakingTier);

      const gasEstimate = await this.publicClient.estimateGas({
        account: this.account,
        to: contractService.contractAddress,
        data: this.publicClient.encodeFunctionData({
          abi: contractService.abi,
          functionName: 'contribute',
          args: [icoAddress, amountWei, currencyType, tierType]
        }),
        value: currency.toUpperCase() === 'ETH' ? amountWei : 0n
      });

      const totalGasCost = gasEstimate * gasPrice;
      const gasCostInEth = utils.fromWei(totalGasCost);

      return {
        gasEstimate: Number(gasEstimate),
        gasPrice: Number(gasPrice),
        totalGasCost: Number(totalGasCost),
        gasCostInEth: parseFloat(gasCostInEth),
        gasCostFormatted: `${parseFloat(gasCostInEth).toFixed(6)} ETH`
      };

    } catch (error) {
      console.error('Failed to estimate transaction cost:', error);
      throw error;
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionHash) {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: transactionHash
      });

      return {
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        transactionHash: receipt.transactionHash,
        confirmations: 1 // Simplified - in production, calculate actual confirmations
      };

    } catch (error) {
      // Transaction might still be pending
      if (error.message.includes('not found')) {
        return {
          status: 'pending',
          transactionHash
        };
      }
      throw error;
    }
  }

  // Wait for transaction confirmation with timeout
  async waitForConfirmation(transactionHash, timeoutMs = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.getTransactionStatus(transactionHash);
        
        if (status.status === 'confirmed') {
          return status;
        } else if (status.status === 'failed') {
          throw new Error('Transaction failed');
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        if (!error.message.includes('not found')) {
          throw error;
        }
        // Continue waiting if transaction not found yet
      }
    }

    throw new Error('Transaction confirmation timeout');
  }

  // Validate contribution inputs
  validateContributionInputs(amount, currency, stakingTier) {
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Invalid contribution amount');
    }

    // Validate currency
    const supportedCurrencies = ['ETH', 'USDC'];
    if (!supportedCurrencies.includes(currency.toUpperCase())) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Validate staking tier
    const supportedTiers = ['7-day', '30-day', '90-day'];
    if (!supportedTiers.includes(stakingTier.toLowerCase())) {
      throw new Error(`Invalid staking tier: ${stakingTier}`);
    }
  }

  // Get staking tier type for contract
  getStakingTierType(stakingTier) {
    const tierMap = {
      '7-day': 0,
      '30-day': 1,
      '90-day': 2
    };
    return tierMap[stakingTier.toLowerCase()];
  }

  // Handle payment errors
  handlePaymentError(error) {
    if (error.message.includes('User rejected')) {
      return new Error(BLOCKCHAIN_ERRORS.USER_REJECTED);
    }
    if (error.message.includes('insufficient funds')) {
      return new Error(BLOCKCHAIN_ERRORS.INSUFFICIENT_FUNDS);
    }
    if (error.message.includes('network')) {
      return new Error(BLOCKCHAIN_ERRORS.NETWORK_ERROR);
    }
    
    return new Error(error.message || 'Payment processing failed');
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        icon: '⟠'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        icon: '💵'
      }
    ];
  }

  // Format currency amount for display
  formatCurrencyAmount(amount, currency) {
    const numAmount = parseFloat(amount);
    
    switch (currency.toUpperCase()) {
      case 'ETH':
        return `${numAmount.toFixed(6)} ETH`;
      case 'USDC':
        return `${numAmount.toFixed(2)} USDC`;
      default:
        return `${numAmount} ${currency}`;
    }
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService;
