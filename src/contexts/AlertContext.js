import React, { createContext, useState, useContext } from 'react';

// Create Alert Context
const AlertContext = createContext();

// Alert Types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  VALIDATION: 'validation' // Added validation specific alert type
};

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  // Add a new alert with deduplication
  const addAlert = (message, type = ALERT_TYPES.INFO, timeout = 5000) => {
    const id = Date.now(); // Use timestamp as unique ID
    const newAlert = { id, message, type };
    
    // Check for duplicate messages of the same type that are still showing
    const hasDuplicate = alerts.some(alert => 
      alert.message === message && alert.type === type
    );
    
    // Only add if not a duplicate
    if (!hasDuplicate) {
      setAlerts(prevAlerts => [...prevAlerts, newAlert]);
      
      // Auto-dismiss alert after timeout
      if (timeout > 0) {
        setTimeout(() => {
          removeAlert(id);
        }, timeout);
      }
      
      return id;
    }
    
    // Return null if duplicate (no new alert added)
    return null;
  };
  
  // Remove an alert by ID
  const removeAlert = (id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };
  
  // Success alert shorthand
  const success = (message, timeout) => {
    return addAlert(message, ALERT_TYPES.SUCCESS, timeout);
  };
  
  // Error alert shorthand
  const error = (message, timeout) => {
    return addAlert(message, ALERT_TYPES.ERROR, timeout);
  };
  
  // Warning alert shorthand
  const warning = (message, timeout) => {
    return addAlert(message, ALERT_TYPES.WARNING, timeout);
  };
  
  // Info alert shorthand
  const info = (message, timeout) => {
    return addAlert(message, ALERT_TYPES.INFO, timeout);
  };
  
  // Validation alert shorthand (shorter timeout, different styling)
  const validation = (message, timeout = 3000) => {
    return addAlert(message, ALERT_TYPES.VALIDATION, timeout);
  };
  
  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };
  
  // Clear alerts by type
  const clearAlertsByType = (type) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.type !== type));
  };
  
  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info,
    validation,
    clearAlerts,
    clearAlertsByType
  };
  
  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;
