// Validation utilities for PumpPal application

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Ethereum address validation
export const validateEthereumAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Amount validation
export const validateAmount = (amount, min = 0, max = Infinity) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount format' };
  }
  
  if (numAmount <= min) {
    return { valid: false, error: `Amount must be greater than ${min}` };
  }
  
  if (numAmount > max) {
    return { valid: false, error: `Amount must be less than or equal to ${max}` };
  }
  
  return { valid: true };
};

// Date validation
export const validateDate = (date, minDate = null, maxDate = null) => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    return { valid: false, error: `Date must be after ${new Date(minDate).toLocaleDateString()}` };
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    return { valid: false, error: `Date must be before ${new Date(maxDate).toLocaleDateString()}` };
  }
  
  return { valid: true };
};

// ICO form validation
export const validateICOForm = (formData) => {
  const errors = {};
  
  // Project name validation
  if (!formData.projectName || formData.projectName.trim().length < 2) {
    errors.projectName = 'Project name must be at least 2 characters';
  }
  
  if (formData.projectName && formData.projectName.length > 50) {
    errors.projectName = 'Project name must be less than 50 characters';
  }
  
  // Token symbol validation
  if (!formData.tokenSymbol || formData.tokenSymbol.trim().length < 2) {
    errors.tokenSymbol = 'Token symbol must be at least 2 characters';
  }
  
  if (formData.tokenSymbol && formData.tokenSymbol.length > 10) {
    errors.tokenSymbol = 'Token symbol must be less than 10 characters';
  }
  
  if (formData.tokenSymbol && !/^[A-Z0-9]+$/.test(formData.tokenSymbol.toUpperCase())) {
    errors.tokenSymbol = 'Token symbol can only contain letters and numbers';
  }
  
  // Total tokens validation
  const totalTokensValidation = validateAmount(formData.totalTokensForSale, 1000, 1000000000);
  if (!totalTokensValidation.valid) {
    errors.totalTokensForSale = totalTokensValidation.error;
  }
  
  // Date validations
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  const startDateValidation = validateDate(formData.saleStartDate, today, oneYearFromNow);
  if (!startDateValidation.valid) {
    errors.saleStartDate = startDateValidation.error;
  }
  
  const endDateValidation = validateDate(formData.saleEndDate, formData.saleStartDate, oneYearFromNow);
  if (!endDateValidation.valid) {
    errors.saleEndDate = endDateValidation.error;
  }
  
  // Contribution limits validation
  const minContribValidation = validateAmount(formData.minContribution, 1, 1000000);
  if (!minContribValidation.valid) {
    errors.minContribution = minContribValidation.error;
  }
  
  const maxContribValidation = validateAmount(formData.maxContribution, parseFloat(formData.minContribution) || 1, 10000000);
  if (!maxContribValidation.valid) {
    errors.maxContribution = maxContribValidation.error;
  }
  
  // Cap validations
  const softCapValidation = validateAmount(formData.softCap, 1000, 100000000);
  if (!softCapValidation.valid) {
    errors.softCap = softCapValidation.error;
  }
  
  const hardCapValidation = validateAmount(formData.hardCap, parseFloat(formData.softCap) || 1000, 1000000000);
  if (!hardCapValidation.valid) {
    errors.hardCap = hardCapValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Contribution form validation
export const validateContributionForm = (formData) => {
  const errors = {};
  
  // Amount validation
  const amountValidation = validateAmount(formData.amount, 0.001, 1000000);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error;
  }
  
  // Currency validation
  const supportedCurrencies = ['ETH', 'USDC'];
  if (!formData.currency || !supportedCurrencies.includes(formData.currency.toUpperCase())) {
    errors.currency = 'Please select a valid currency';
  }
  
  // Staking tier validation
  const supportedTiers = ['7-day', '30-day', '90-day'];
  if (!formData.stakingTier || !supportedTiers.includes(formData.stakingTier.toLowerCase())) {
    errors.stakingTier = 'Please select a valid staking tier';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  let strength = 'weak';
  const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, password.length >= minLength].filter(Boolean).length;
  
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    valid: errors.length === 0,
    errors,
    strength,
    score
  };
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Phone number validation (basic)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

// String length validation
export const validateStringLength = (value, min = 0, max = Infinity, fieldName = 'Field') => {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  if (value.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  
  if (value.length > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max} characters` };
  }
  
  return { valid: true };
};

// Numeric range validation
export const validateNumericRange = (value, min = -Infinity, max = Infinity, fieldName = 'Value') => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  
  if (numValue < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (numValue > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max}` };
  }
  
  return { valid: true };
};

// File validation
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = []) => {
  const errors = [];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Batch validation utility
export const validateFields = (data, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = data[field];
    
    for (const rule of rules) {
      const result = rule(value, field);
      if (!result.valid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    valid: isValid,
    errors
  };
};

// Export all validation functions
export default {
  validateEmail,
  validateEthereumAddress,
  validateAmount,
  validateDate,
  validateICOForm,
  validateContributionForm,
  validatePasswordStrength,
  validateURL,
  validatePhoneNumber,
  validateRequired,
  validateStringLength,
  validateNumericRange,
  validateFile,
  validateFields
};
