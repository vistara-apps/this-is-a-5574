// Error handling utilities for PumpPal application

// Error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Custom error class
export class PumpPalError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN_ERROR, severity = ERROR_SEVERITY.MEDIUM, details = null) {
    super(message);
    this.name = 'PumpPalError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Error factory functions
export const createValidationError = (message, details = null) => {
  return new PumpPalError(message, ERROR_TYPES.VALIDATION_ERROR, ERROR_SEVERITY.LOW, details);
};

export const createNetworkError = (message, details = null) => {
  return new PumpPalError(message, ERROR_TYPES.NETWORK_ERROR, ERROR_SEVERITY.MEDIUM, details);
};

export const createAPIError = (message, details = null) => {
  return new PumpPalError(message, ERROR_TYPES.API_ERROR, ERROR_SEVERITY.MEDIUM, details);
};

export const createBlockchainError = (message, details = null) => {
  return new PumpPalError(message, ERROR_TYPES.BLOCKCHAIN_ERROR, ERROR_SEVERITY.HIGH, details);
};

export const createAuthenticationError = (message, details = null) => {
  return new PumpPalError(message, ERROR_TYPES.AUTHENTICATION_ERROR, ERROR_SEVERITY.HIGH, details);
};

// Error message formatter
export const formatErrorMessage = (error) => {
  if (error instanceof PumpPalError) {
    return error.message;
  }

  // Handle common error patterns
  if (error.message) {
    // Blockchain errors
    if (error.message.includes('User rejected')) {
      return 'Transaction was cancelled by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for this transaction';
    }
    if (error.message.includes('network')) {
      return 'Network connection error. Please check your internet connection';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again';
    }

    // API errors
    if (error.response?.status === 401) {
      return 'Authentication required. Please log in';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found';
    }
    if (error.response?.status >= 500) {
      return 'Server error. Please try again later';
    }

    return error.message;
  }

  return 'An unexpected error occurred';
};

// User-friendly error messages
export const getUserFriendlyMessage = (error) => {
  const baseMessage = formatErrorMessage(error);
  
  const friendlyMessages = {
    'User rejected the transaction': 'You cancelled the transaction. No worries, you can try again anytime!',
    'Insufficient funds for transaction': 'You don\'t have enough funds for this transaction. Please add more funds to your wallet.',
    'Network connection error': 'Having trouble connecting. Please check your internet connection and try again.',
    'Wallet not connected': 'Please connect your wallet to continue.',
    'Invalid contribution amount': 'Please enter a valid contribution amount.',
    'Transaction failed': 'The transaction couldn\'t be completed. Please try again.',
    'Contract execution error': 'There was an issue with the smart contract. Please try again or contact support.',
    'Authentication required': 'Please log in to access this feature.',
    'Permission denied': 'You don\'t have permission to perform this action.',
    'Resource not found': 'The item you\'re looking for doesn\'t exist or has been removed.',
    'Server error': 'Our servers are having issues. Please try again in a few minutes.'
  };

  return friendlyMessages[baseMessage] || baseMessage;
};

// Error logging utility
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    type: error.type || ERROR_TYPES.UNKNOWN_ERROR,
    severity: error.severity || ERROR_SEVERITY.MEDIUM,
    timestamp: new Date().toISOString(),
    context,
    stack: error.stack,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('PumpPal Error:', errorInfo);
  }

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    try {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Production Error:', errorInfo);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  return errorInfo;
};

// Error boundary helper
export const handleAsyncError = async (asyncFunction, context = {}) => {
  try {
    return await asyncFunction();
  } catch (error) {
    const enhancedError = error instanceof PumpPalError 
      ? error 
      : new PumpPalError(error.message, ERROR_TYPES.UNKNOWN_ERROR, ERROR_SEVERITY.MEDIUM, error);
    
    logError(enhancedError, context);
    throw enhancedError;
  }
};

// Retry utility with exponential backoff
export const retryWithBackoff = async (
  asyncFunction, 
  maxRetries = 3, 
  baseDelay = 1000,
  context = {}
) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFunction();
    } catch (error) {
      lastError = error;
      
      // Don't retry certain types of errors
      if (error.type === ERROR_TYPES.VALIDATION_ERROR || 
          error.type === ERROR_TYPES.AUTHENTICATION_ERROR ||
          error.message?.includes('User rejected')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        logError(error, { ...context, attempt, maxRetries });
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Error recovery suggestions
export const getRecoverySuggestions = (error) => {
  const suggestions = [];
  
  if (error.type === ERROR_TYPES.NETWORK_ERROR) {
    suggestions.push('Check your internet connection');
    suggestions.push('Try refreshing the page');
    suggestions.push('Switch to a different network if available');
  }
  
  if (error.type === ERROR_TYPES.BLOCKCHAIN_ERROR) {
    suggestions.push('Make sure your wallet is connected');
    suggestions.push('Check if you have sufficient funds');
    suggestions.push('Try increasing the gas fee');
    suggestions.push('Wait a moment and try again');
  }
  
  if (error.type === ERROR_TYPES.API_ERROR) {
    suggestions.push('Try refreshing the page');
    suggestions.push('Check if the service is temporarily unavailable');
    suggestions.push('Contact support if the problem persists');
  }
  
  if (error.type === ERROR_TYPES.AUTHENTICATION_ERROR) {
    suggestions.push('Try logging in again');
    suggestions.push('Clear your browser cache and cookies');
    suggestions.push('Make sure your wallet is connected');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Try refreshing the page');
    suggestions.push('Contact support if the problem continues');
  }
  
  return suggestions;
};

// Error notification helper
export const createErrorNotification = (error) => {
  return {
    id: Date.now().toString(),
    type: 'error',
    title: 'Error',
    message: getUserFriendlyMessage(error),
    suggestions: getRecoverySuggestions(error),
    timestamp: new Date().toISOString(),
    severity: error.severity || ERROR_SEVERITY.MEDIUM,
    dismissible: true,
    autoHide: error.severity === ERROR_SEVERITY.LOW,
    duration: error.severity === ERROR_SEVERITY.LOW ? 5000 : 0
  };
};

// Global error handler
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(event.reason);
    
    logError(error, { type: 'unhandledrejection' });
    
    // Prevent the default browser error handling
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = new Error(event.message);
    error.filename = event.filename;
    error.lineno = event.lineno;
    error.colno = event.colno;
    
    logError(error, { type: 'uncaughterror' });
  });
};

// Error boundary component helper
export const withErrorBoundary = (Component, fallbackComponent = null) => {
  return class ErrorBoundaryWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      logError(error, { errorInfo, component: Component.name });
    }

    render() {
      if (this.state.hasError) {
        if (fallbackComponent) {
          return React.createElement(fallbackComponent, { error: this.state.error });
        }
        
        return React.createElement('div', {
          className: 'error-boundary p-4 bg-red-50 border border-red-200 rounded-lg'
        }, [
          React.createElement('h3', { 
            key: 'title',
            className: 'text-lg font-semibold text-red-800 mb-2' 
          }, 'Something went wrong'),
          React.createElement('p', { 
            key: 'message',
            className: 'text-red-600' 
          }, getUserFriendlyMessage(this.state.error))
        ]);
      }

      return React.createElement(Component, this.props);
    }
  };
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  PumpPalError,
  createValidationError,
  createNetworkError,
  createAPIError,
  createBlockchainError,
  createAuthenticationError,
  formatErrorMessage,
  getUserFriendlyMessage,
  logError,
  handleAsyncError,
  retryWithBackoff,
  getRecoverySuggestions,
  createErrorNotification,
  setupGlobalErrorHandler,
  withErrorBoundary
};
