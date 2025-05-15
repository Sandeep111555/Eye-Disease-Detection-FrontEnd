import React from 'react';
import Input from './Input';

/**
 * FormField component for creating consistent form layouts with validation
 * This component wraps the Input component and adds layout options
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  isValid = true,
  showValidation = false,
  helpText = '',
  containerClassName = '',
  inputClassName = '',
  layout = 'vertical', // 'vertical', 'horizontal', or 'compact'
  width = 'full', // 'full', '1/2', '1/3', '2/3', '1/4', '3/4'
  children = null
}) => {
  const getWidthClass = () => {
    switch (width) {
      case '1/2': return 'w-full sm:w-1/2';
      case '1/3': return 'w-full sm:w-1/3';
      case '2/3': return 'w-full sm:w-2/3';
      case '1/4': return 'w-full sm:w-1/4';
      case '3/4': return 'w-full sm:w-3/4';
      case 'full':
      default: return 'w-full';
    }
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'horizontal':
        return 'sm:flex sm:items-center';
      case 'compact':
        return 'flex flex-col space-y-1';
      case 'vertical':
      default:
        return '';
    }
  };

  const getLabelClass = () => {
    switch (layout) {
      case 'horizontal':
        return 'sm:w-1/3 sm:text-right sm:pr-4';
      case 'compact':
        return '';
      case 'vertical':
      default:
        return '';
    }
  };

  const getInputContainerClass = () => {
    switch (layout) {
      case 'horizontal':
        return 'sm:w-2/3';
      case 'compact':
        return '';
      case 'vertical':
      default:
        return '';
    }
  };

  return (
    <div className={`${getWidthClass()} ${getLayoutClass()} ${containerClassName}`}>
      <Input
        label={label}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        isValid={isValid}
        showValidation={showValidation}
        helpText={helpText}
        className={inputClassName}
        labelClassName={getLabelClass()}
        inputContainerClassName={getInputContainerClass()}
      />
      {children}
    </div>
  );
};

export default FormField;
