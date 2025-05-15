import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  required = false,
  disabled = false,
  className = '',
  error = '',
  isValid = true,
  showValidation = false,
  helpText = '',
  labelClassName = '',
  inputContainerClassName = ''
}) => {
  // Determine proper styling based on validation state
  const getBorderStyle = () => {
    if (disabled) return 'border-gray-300 bg-gray-100 cursor-not-allowed';
    if (error) return 'border-red-300 focus:ring-red-500 focus:border-red-500';
    if (showValidation && isValid && value) return 'border-green-300 focus:ring-green-500 focus:border-green-500';
    return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`relative ${inputContainerClassName}`}>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getBorderStyle()} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        />
        {showValidation && isValid && value && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>{error}</p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500" id={`${name}-help`}>{helpText}</p>
      )}
    </div>  );
};

export default Input;
