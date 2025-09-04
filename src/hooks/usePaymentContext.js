import { useWalletClient, useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import paymentService from "../services/paymentService.js";

export function usePaymentContext() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize payment service when wallet connects
  useEffect(() => {
    if (walletClient && walletClient.account && isConnected) {
      paymentService.initializeWallet(walletClient.account);
      setIsInitialized(true);
      loadBalances();
    } else {
      setIsInitialized(false);
      setBalances({});
    }
  }, [walletClient, isConnected, address]);

  // Load wallet balances
  const loadBalances = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const [ethBalance, usdcBalance] = await Promise.all([
        paymentService.getBalance('ETH'),
        paymentService.getBalance('USDC')
      ]);

      setBalances({
        ETH: ethBalance,
        USDC: usdcBalance
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  }, [isInitialized]);

  // Process a contribution payment
  const processContribution = useCallback(async (icoAddress, amount, currency, stakingTier) => {
    if (!isInitialized) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await paymentService.processContribution(
        icoAddress,
        amount,
        currency,
        stakingTier
      );

      // Reload balances after successful payment
      await loadBalances();

      return result;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }, [isInitialized, loadBalances]);

  // Check if user has sufficient balance
  const checkSufficientBalance = useCallback(async (amount, currency) => {
    if (!isInitialized) {
      throw new Error("Wallet not connected");
    }

    return await paymentService.checkSufficientBalance(amount, currency);
  }, [isInitialized]);

  // Estimate transaction costs
  const estimateTransactionCost = useCallback(async (icoAddress, amount, currency, stakingTier) => {
    if (!isInitialized) {
      throw new Error("Wallet not connected");
    }

    return await paymentService.estimateTransactionCost(icoAddress, amount, currency, stakingTier);
  }, [isInitialized]);

  // Get transaction status
  const getTransactionStatus = useCallback(async (transactionHash) => {
    return await paymentService.getTransactionStatus(transactionHash);
  }, []);

  // Wait for transaction confirmation
  const waitForConfirmation = useCallback(async (transactionHash, timeoutMs = 60000) => {
    return await paymentService.waitForConfirmation(transactionHash, timeoutMs);
  }, []);

  // Get supported currencies
  const getSupportedCurrencies = useCallback(() => {
    return paymentService.getSupportedCurrencies();
  }, []);

  // Format currency amount
  const formatCurrencyAmount = useCallback((amount, currency) => {
    return paymentService.formatCurrencyAmount(amount, currency);
  }, []);

  // Legacy method for backward compatibility
  const createSession = useCallback(async (amount = "$0.001") => {
    console.warn('createSession is deprecated, use processContribution instead');
    
    if (!walletClient || !walletClient.account) throw new Error("please connect your wallet");
    if (isError) throw new Error("wallet not connected");
    if (isLoading) throw new Error("wallet is loading");
    
    // Return mock response for backward compatibility
    return {
      amount,
      walletAddress: address,
      timestamp: new Date().toISOString()
    };
  }, [walletClient, isError, isLoading, address]);

  return {
    // Wallet state
    isConnected: isConnected && isInitialized,
    isLoading,
    isError,
    address,
    balances,
    
    // Payment methods
    processContribution,
    checkSufficientBalance,
    estimateTransactionCost,
    getTransactionStatus,
    waitForConfirmation,
    
    // Utility methods
    loadBalances,
    getSupportedCurrencies,
    formatCurrencyAmount,
    
    // Legacy method
    createSession
  };
}
