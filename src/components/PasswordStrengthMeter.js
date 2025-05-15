import React from 'react';
import { calculatePasswordStrength } from '../utils/ValidationUtils';

const PasswordStrengthMeter = ({ password }) => {
  const strength = calculatePasswordStrength(password);
  const strengthPercentage = (strength.score / 6) * 100;
  
  return (
    <div className="mt-1 mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Password Strength</span>
        <span className={`text-xs font-medium ${
          strength.label === 'Weak' ? 'text-red-600' : 
          strength.label === 'Moderate' ? 'text-yellow-600' : 
          strength.label === 'Strong' ? 'text-green-600' : 'text-gray-500'
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.color} transition-all duration-300`} 
          style={{ width: `${strengthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
