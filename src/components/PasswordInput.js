import React, { useState } from 'react';
import Input from './Input';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { validatePasswordStrength } from '../utils/ValidationUtils';

/**
 * PasswordInput component
 * Extends the standard Input component with password-specific features:
 * - Password visibility toggle
 * - Password strength meter
 * - Password requirements display
 */
const PasswordInput = ({
  label = 'Password',
  name,
  value,
  onChange,
  placeholder = 'Enter password',
  required = true,
  showStrengthMeter = false,
  showRequirements = false,
  validateOnChange = false,
  error = '',
  helpText = '',
  className = '',
  ...otherProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle password change with optional validation
  const handlePasswordChange = (e) => {
    const newValue = e.target.value;
    
    // Call the parent onChange handler
    if (onChange) {
      onChange(e);
    }
    
    // Perform validation if needed
    if (validateOnChange && newValue) {
      const validation = validatePasswordStrength(newValue);
      setValidationMessage(validation.isValid ? '' : validation.message);
    } else {
      setValidationMessage('');
    }
  };
  
  // Determine if we should show an error
  const displayError = error || validationMessage;
  
  return (
    <div className="mb-4">
      <div className="relative">
        <Input
          label={label}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          required={required}
          error={displayError}
          helpText={helpText}
          className={`pr-10 ${className}`}
          {...otherProps}
        />
        
        {/* Password visibility toggle button */}
        <button
          type="button"
          className="absolute right-2 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={togglePasswordVisibility}
          tabIndex="-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Password strength meter */}
      {showStrengthMeter && value && (
        <div className="mt-2">
          <PasswordStrengthMeter password={value} />
        </div>
      )}
      
      {/* Password requirements */}
      {showRequirements && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p>Password requirements:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li className={value && value.length >= 8 ? 'text-green-600' : ''}>
              At least 8 characters
            </li>
            <li className={value && /[A-Z]/.test(value) ? 'text-green-600' : ''}>
              At least one uppercase letter
            </li>
            <li className={value && /[a-z]/.test(value) ? 'text-green-600' : ''}>
              At least one lowercase letter
            </li>
            <li className={value && /[0-9]/.test(value) ? 'text-green-600' : ''}>
              At least one number
            </li>
            <li className={value && /[^A-Za-z0-9]/.test(value) ? 'text-green-600' : ''}>
              At least one special character
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
