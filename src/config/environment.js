// Environment configuration for PumpPal

// Get environment variables with defaults
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTest = import.meta.env.MODE === 'test';

// Application configuration
export const APP_CONFIG = {
  name: 'PumpPal',
  version: '1.0.0',
  environment: getEnvVar('VITE_APP_ENV', 'development'),
  baseUrl: window.location.origin,
  supportEmail: getEnvVar('VITE_SUPPORT_EMAIL', 'support@pumppal.io'),
  docsUrl: getEnvVar('VITE_DOCS_URL', 'https://docs.pumppal.io'),
  statusPageUrl: getEnvVar('VITE_STATUS_PAGE_URL', 'https://status.pumppal.io')
};

// API configuration
export const API_CONFIG = {
  baseUrl: getEnvVar('VITE_API_BASE_URL', 'https://api.pumppal.io'),
  version: getEnvVar('VITE_API_VERSION', 'v1'),
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  network: getEnvVar('VITE_NETWORK', 'testnet'),
  baseRpcUrl: getEnvVar('VITE_BASE_RPC_URL', 'https://sepolia.base.org'),
  baseMainnetRpcUrl: getEnvVar('VITE_BASE_MAINNET_RPC_URL', 'https://mainnet.base.org'),
  
  // Contract addresses
  contracts: {
    testnet: {
      ico: getEnvVar('VITE_ICO_CONTRACT_ADDRESS', '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5f'),
      usdc: getEnvVar('VITE_USDC_CONTRACT_ADDRESS', '0x036CbD53842c5426634e7929541eC2318f3dCF7e')
    },
    mainnet: {
      ico: getEnvVar('VITE_ICO_CONTRACT_ADDRESS_MAINNET', '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5f'),
      usdc: getEnvVar('VITE_USDC_CONTRACT_ADDRESS_MAINNET', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
    }
  },
  
  // Chain IDs
  chainIds: {
    testnet: 84532, // Base Sepolia
    mainnet: 8453   // Base Mainnet
  },
  
  // Block confirmations required
  confirmations: {
    testnet: 1,
    mainnet: 3
  }
};

// Wallet configuration
export const WALLET_CONFIG = {
  walletConnectProjectId: getEnvVar('VITE_WALLET_CONNECT_PROJECT_ID'),
  enableWalletConnect: getEnvVar('VITE_ENABLE_WALLET_CONNECT', 'true') === 'true',
  supportedWallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet'],
  autoConnect: true,
  cacheProvider: true
};

// Third-party services
export const SERVICES_CONFIG = {
  alchemy: {
    apiKey: getEnvVar('VITE_ALCHEMY_API_KEY'),
    enabled: !!getEnvVar('VITE_ALCHEMY_API_KEY')
  },
  quicknode: {
    endpoint: getEnvVar('VITE_QUICKNODE_ENDPOINT'),
    enabled: !!getEnvVar('VITE_QUICKNODE_ENDPOINT')
  },
  pinata: {
    apiKey: getEnvVar('VITE_PINATA_API_KEY'),
    secretKey: getEnvVar('VITE_PINATA_SECRET_KEY'),
    enabled: !!(getEnvVar('VITE_PINATA_API_KEY') && getEnvVar('VITE_PINATA_SECRET_KEY'))
  },
  stripe: {
    publishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
    enabled: !!getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY')
  }
};

// Analytics and monitoring
export const ANALYTICS_CONFIG = {
  sentry: {
    dsn: getEnvVar('VITE_SENTRY_DSN'),
    enabled: !!getEnvVar('VITE_SENTRY_DSN') && isProduction,
    environment: APP_CONFIG.environment,
    tracesSampleRate: isProduction ? 0.1 : 1.0
  },
  googleAnalytics: {
    measurementId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    enabled: !!getEnvVar('VITE_GOOGLE_ANALYTICS_ID') && isProduction
  },
  mixpanel: {
    token: getEnvVar('VITE_MIXPANEL_TOKEN'),
    enabled: !!getEnvVar('VITE_MIXPANEL_TOKEN') && isProduction
  }
};

// Feature flags
export const FEATURE_FLAGS = {
  staking: getEnvVar('VITE_ENABLE_STAKING', 'true') === 'true',
  analytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
  notifications: getEnvVar('VITE_ENABLE_NOTIFICATIONS', 'true') === 'true',
  debugMode: getEnvVar('VITE_ENABLE_DEBUG_MODE', 'false') === 'true' || isDevelopment,
  mockApi: getEnvVar('VITE_MOCK_API', 'false') === 'true',
  devtools: getEnvVar('VITE_ENABLE_DEVTOOLS', 'true') === 'true' && isDevelopment
};

// Payment configuration
export const PAYMENT_CONFIG = {
  gatewayUrl: getEnvVar('VITE_PAYMENT_GATEWAY_URL', 'https://payments.vistara.dev'),
  supportedCurrencies: ['ETH', 'USDC'],
  defaultCurrency: 'USDC',
  minContribution: 0.001,
  maxContribution: 1000000,
  gasLimitMultiplier: 1.2,
  gasPriceMultiplier: 1.1
};

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: getEnvVar('VITE_IPFS_GATEWAY', 'https://gateway.pinata.cloud'),
  pinataApiKey: getEnvVar('VITE_PINATA_API_KEY'),
  pinataSecretKey: getEnvVar('VITE_PINATA_SECRET_KEY'),
  timeout: 30000,
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

// Security configuration
export const SECURITY_CONFIG = {
  enableCSP: getEnvVar('VITE_ENABLE_CSP', 'true') === 'true',
  allowedOrigins: getEnvVar('VITE_ALLOWED_ORIGINS', 'http://localhost:3000,https://pumppal.io').split(','),
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000 // 15 minutes
};

// Development configuration
export const DEV_CONFIG = {
  logLevel: getEnvVar('VITE_LOG_LEVEL', isDevelopment ? 'debug' : 'error'),
  enableDevtools: FEATURE_FLAGS.devtools,
  mockApi: FEATURE_FLAGS.mockApi,
  hotReload: isDevelopment,
  sourceMap: isDevelopment
};

// Social media and marketing
export const SOCIAL_CONFIG = {
  twitter: getEnvVar('VITE_TWITTER_HANDLE', '@PumpPalICO'),
  discord: getEnvVar('VITE_DISCORD_INVITE', 'https://discord.gg/pumppal'),
  telegram: getEnvVar('VITE_TELEGRAM_CHANNEL', 'https://t.me/pumppal'),
  github: 'https://github.com/pumppal',
  medium: 'https://medium.com/@pumppal'
};

// Staking configuration
export const STAKING_CONFIG = {
  enabled: FEATURE_FLAGS.staking,
  tiers: {
    '7-day': {
      lockDurationDays: 7,
      rewardPercentage: 5,
      minimumInvestment: 100
    },
    '30-day': {
      lockDurationDays: 30,
      rewardPercentage: 12,
      minimumInvestment: 500
    },
    '90-day': {
      lockDurationDays: 90,
      rewardPercentage: 25,
      minimumInvestment: 1000
    }
  },
  rewardCalculationInterval: 24 * 60 * 60 * 1000, // 24 hours
  claimCooldown: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Notification configuration
export const NOTIFICATION_CONFIG = {
  enabled: FEATURE_FLAGS.notifications,
  defaultDuration: 5000,
  maxNotifications: 5,
  position: 'top-right',
  types: {
    success: { duration: 3000, dismissible: true },
    error: { duration: 0, dismissible: true },
    warning: { duration: 5000, dismissible: true },
    info: { duration: 4000, dismissible: true }
  }
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  api: {
    requests: 100,
    window: 60 * 1000 // 1 minute
  },
  blockchain: {
    requests: 50,
    window: 60 * 1000 // 1 minute
  }
};

// Cache configuration
export const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  strategies: {
    blockchain: { ttl: 30 * 1000 }, // 30 seconds
    api: { ttl: 2 * 60 * 1000 }, // 2 minutes
    static: { ttl: 60 * 60 * 1000 } // 1 hour
  }
};

// Export current network configuration
export const getCurrentNetworkConfig = () => {
  const network = BLOCKCHAIN_CONFIG.network;
  return {
    network,
    rpcUrl: network === 'mainnet' ? BLOCKCHAIN_CONFIG.baseMainnetRpcUrl : BLOCKCHAIN_CONFIG.baseRpcUrl,
    chainId: BLOCKCHAIN_CONFIG.chainIds[network],
    contracts: BLOCKCHAIN_CONFIG.contracts[network],
    confirmations: BLOCKCHAIN_CONFIG.confirmations[network]
  };
};

// Validate configuration
export const validateConfig = () => {
  const errors = [];
  
  // Check required environment variables
  if (!API_CONFIG.baseUrl) {
    errors.push('VITE_API_BASE_URL is required');
  }
  
  if (WALLET_CONFIG.enableWalletConnect && !WALLET_CONFIG.walletConnectProjectId) {
    errors.push('VITE_WALLET_CONNECT_PROJECT_ID is required when WalletConnect is enabled');
  }
  
  if (ANALYTICS_CONFIG.sentry.enabled && !ANALYTICS_CONFIG.sentry.dsn) {
    errors.push('VITE_SENTRY_DSN is required when Sentry is enabled');
  }
  
  // Validate network configuration
  const networkConfig = getCurrentNetworkConfig();
  if (!networkConfig.contracts.ico) {
    errors.push(`ICO contract address is required for ${networkConfig.network} network`);
  }
  
  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    if (isProduction) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }
  
  return errors.length === 0;
};

// Initialize configuration validation
if (isProduction) {
  validateConfig();
}

export default {
  APP_CONFIG,
  API_CONFIG,
  BLOCKCHAIN_CONFIG,
  WALLET_CONFIG,
  SERVICES_CONFIG,
  ANALYTICS_CONFIG,
  FEATURE_FLAGS,
  PAYMENT_CONFIG,
  IPFS_CONFIG,
  SECURITY_CONFIG,
  DEV_CONFIG,
  SOCIAL_CONFIG,
  STAKING_CONFIG,
  NOTIFICATION_CONFIG,
  RATE_LIMIT_CONFIG,
  CACHE_CONFIG,
  getCurrentNetworkConfig,
  validateConfig,
  isDevelopment,
  isProduction,
  isTest
};
