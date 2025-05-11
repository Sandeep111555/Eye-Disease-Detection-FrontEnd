import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

const UserProfile = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [username, setUsername] = useState('User');

  // Get username from JWT token 
  useEffect(() => {
    try {
      const token = AuthService.getToken();
      if (token) {
        // Basic parsing of JWT to get user info (in a real app, you'd use a proper JWT library)
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        if (decodedPayload && decodedPayload.sub) {
          setUsername(decodedPayload.sub);
        }
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="ml-2 text-gray-700 hidden md:block">{username}</span>
        <svg 
          className="ml-1 h-5 w-5 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Profile Settings
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
