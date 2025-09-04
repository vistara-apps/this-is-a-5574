import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Network configuration
const NETWORKS = {
  mainnet: {
    chain: base,
    rpcUrl: 'https://mainnet.base.org',
    name: 'Base Mainnet'
  },
  testnet: {
    chain: baseSepolia,
    rpcUrl: 'https://sepolia.base.org',
    name: 'Base Sepolia'
  }
};

// Get current network based on environment
export const getCurrentNetwork = () => {
  const isProduction = import.meta.env.PROD;
  return isProduction ? NETWORKS.mainnet : NETWORKS.testnet;
};

// Create public client for reading blockchain data
export const createPublicClientForNetwork = (network = getCurrentNetwork()) => {
  return createPublicClient({
    chain: network.chain,
    transport: http(network.rpcUrl)
  });
};

// Create wallet client for transactions
export const createWalletClientForNetwork = (account, network = getCurrentNetwork()) => {
  return createWalletClient({
    account,
    chain: network.chain,
    transport: http(network.rpcUrl)
  });
};

// Utility functions for common blockchain operations
export const utils = {
  // Convert ETH to Wei
  toWei: (amount) => parseEther(amount.toString()),
  
  // Convert Wei to ETH
  fromWei: (amount) => formatEther(amount),
  
  // Format address for display
  formatAddress: (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
  
  // Validate Ethereum address
  isValidAddress: (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },
  
  // Convert timestamp to date
  timestampToDate: (timestamp) => {
    return new Date(timestamp * 1000);
  },
  
  // Convert date to timestamp
  dateToTimestamp: (date) => {
    return Math.floor(new Date(date).getTime() / 1000);
  },
  
  // Calculate percentage
  calculatePercentage: (current, total) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  },
  
  // Format currency amount
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
};

// Currency types for the ICO
export const CURRENCIES = {
  ETH: 0,
  USDC: 1,
  SOL: 2
};

// ICO Status types
export const ICO_STATUS = {
  DRAFT: 0,
  ACTIVE: 1,
  ENDED: 2,
  CANCELLED: 3,
  FINALIZED: 4
};

// Staking tier types
export const STAKING_TIERS = {
  SEVEN_DAY: 0,
  THIRTY_DAY: 1,
  NINETY_DAY: 2
};

// Error types for better error handling
export const BLOCKCHAIN_ERRORS = {
  USER_REJECTED: 'User rejected the transaction',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  NETWORK_ERROR: 'Network connection error',
  CONTRACT_ERROR: 'Smart contract execution error',
  INVALID_ADDRESS: 'Invalid wallet address',
  TRANSACTION_FAILED: 'Transaction failed'
};

// Gas estimation utilities
export const gasUtils = {
  // Estimate gas for a transaction
  estimateGas: async (publicClient, transaction) => {
    try {
      return await publicClient.estimateGas(transaction);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw new Error(BLOCKCHAIN_ERRORS.CONTRACT_ERROR);
    }
  },
  
  // Get current gas price
  getGasPrice: async (publicClient) => {
    try {
      return await publicClient.getGasPrice();
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw new Error(BLOCKCHAIN_ERRORS.NETWORK_ERROR);
    }
  }
};

// Transaction utilities
export const transactionUtils = {
  // Wait for transaction confirmation
  waitForTransaction: async (publicClient, hash, confirmations = 1) => {
    try {
      return await publicClient.waitForTransactionReceipt({
        hash,
        confirmations
      });
    } catch (error) {
      console.error('Transaction confirmation failed:', error);
      throw new Error(BLOCKCHAIN_ERRORS.TRANSACTION_FAILED);
    }
  },
  
  // Get transaction details
  getTransaction: async (publicClient, hash) => {
    try {
      return await publicClient.getTransaction({ hash });
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw new Error(BLOCKCHAIN_ERRORS.NETWORK_ERROR);
    }
  }
};

export default {
  getCurrentNetwork,
  createPublicClientForNetwork,
  createWalletClientForNetwork,
  utils,
  CURRENCIES,
  ICO_STATUS,
  STAKING_TIERS,
  BLOCKCHAIN_ERRORS,
  gasUtils,
  transactionUtils
};
