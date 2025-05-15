import React from 'react';

/**
 * FormGroup component for creating consistent form layouts
 * Groups form fields together with consistent spacing and styling
 */
const FormGroup = ({
  title = '',
  description = '',
  children,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  layout = 'vertical', // 'vertical', 'horizontal', 'grid'
  columns = 1, // Used for grid layout (1, 2, 3, 4)
  divider = false,
  padding = true,
  marginBottom = true
}) => {
  const getLayoutClass = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap items-start';
      case 'grid':
        return `grid gap-4 ${getColumnsClass()}`;
      case 'vertical':
      default:
        return 'space-y-4';
    }
  };

  const getColumnsClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <div className={`${marginBottom ? 'mb-8' : ''} ${className}`}>
      {title && (
        <h3 className={`text-lg font-medium text-gray-900 ${titleClassName}`}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={`mt-1 text-sm text-gray-500 ${descriptionClassName}`}>
          {description}
        </p>
      )}
      
      {(title || description) && <div className="mt-3"></div>}
      
      <div className={`${padding ? 'py-4' : ''} ${getLayoutClass()}`}>
        {children}
      </div>
      
      {divider && <hr className="mt-6 border-gray-200" />}
    </div>
  );
};

export default FormGroup;
