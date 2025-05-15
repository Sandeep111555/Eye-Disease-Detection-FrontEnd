/**
 * Validation utility functions for form validation across the application
 */

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Object containing validation result and message
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Checks if two passwords match
 * @param {string} password - The main password
 * @param {string} confirmPassword - The confirmation password
 * @returns {Object} - Object containing validation result and message
 */
export const passwordsMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true, message: 'Passwords match' };
};

/**
 * Validates image file type and size
 * @param {File} file - The file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Object} - Object containing validation result and message
 */
export const validateImageFile = (file, maxSizeInMB = 5) => {
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }
  
  // Validate file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { 
      isValid: false, 
      message: `File size exceeds ${maxSizeInMB}MB limit. Please upload a smaller image.` 
    };
  }
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `Unsupported file format: ${file.type}. Please upload a JPEG or PNG image.` 
    };
  }
  
  return { isValid: true, message: 'File is valid' };
};

/**
 * Calculates password strength score
 * @param {string} password - The password to check
 * @returns {Object} - Object containing score, label, and color
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'None', color: 'bg-gray-200' };

  let score = 0;
  
  // Add points for length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Add points for complexity
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Determine strength label and color based on score
  switch (true) {
    case (score <= 2):
      return { score, label: 'Weak', color: 'bg-red-500' };
    case (score <= 4):
      return { score, label: 'Moderate', color: 'bg-yellow-500' };
    case (score <= 6):
      return { score, label: 'Strong', color: 'bg-green-500' };
    default:
      return { score: 0, label: 'None', color: 'bg-gray-200' };
  }
};

/**
 * Validates a name field (first name, last name, etc.)
 * @param {string} name - The name to validate
 * @returns {Object} - Object with isValid flag and message
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      message: 'This field is required'
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      message: 'Must be at least 2 characters'
    };
  }

  // Check if name contains only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      message: 'Please enter a valid name'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates a numeric input
 * @param {string} value - The value to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and message
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, required = false } = options;
  
  if (!value) {
    return {
      isValid: !required,
      message: required ? 'This field is required' : ''
    };
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: 'Please enter a valid number'
    };
  }
  
  if (min !== undefined && numValue < min) {
    return {
      isValid: false,
      message: `Value must be at least ${min}`
    };
  }
  
  if (max !== undefined && numValue > max) {
    return {
      isValid: false,
      message: `Value must be at most ${max}`
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates a required field
 * @param {string} value - The value to validate
 * @returns {Object} - Object with isValid flag and message
 */
export const validateRequired = (value) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      isValid: false,
      message: 'This field is required'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};
