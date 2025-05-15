import React from 'react';

/**
 * FormSection component for organizing form content into logical sections
 * Used to group related form controls with a title, description, and visual separation
 */
const FormSection = ({
  title,
  description,
  children,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  contentClassName = '',
  bordered = false,
  collapsible = false,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      className={`mb-8 ${bordered ? 'border border-gray-200 rounded-lg overflow-hidden' : ''} ${className}`}
    >
      {/* Section Header */}
      {title && (
        <div 
          className={`${
            bordered ? 'px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200' : 'mb-4'
          } ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={toggle}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-medium text-gray-900 ${titleClassName}`}>{title}</h3>
            
            {collapsible && (
              <button 
                type="button"
                className="text-gray-400 hover:text-gray-500"
                aria-expanded={isOpen}
              >
                <span className="sr-only">{isOpen ? 'Collapse section' : 'Expand section'}</span>
                <svg 
                  className={`h-5 w-5 transform ${isOpen ? 'rotate-180' : ''} transition-transform duration-200`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {description && (
            <p className={`mt-1 text-sm text-gray-500 ${descriptionClassName}`}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || isOpen) && (
        <div className={`${bordered ? 'px-4 py-5 sm:p-6' : ''} ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;
