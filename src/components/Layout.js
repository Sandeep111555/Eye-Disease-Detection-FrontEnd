import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eyeLogo from '../assets/images/eye-logo.png';
import AuthService from '../services/AuthService';
import UserProfile from './UserProfile';
import { useAlert } from '../contexts/AlertContext';

const Header = () => {
  const navigate = useNavigate();
  const { success } = useAlert();
  
  const handleLogout = () => {
    // Use AuthService to logout and clear tokens
    AuthService.logout();
    // Show success message
    success('You have been successfully logged out');
    // Redirect to login page
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src={eyeLogo} alt="Eye Vision Logo" className="h-10 w-10 mr-2" />
            <span className="text-xl font-semibold text-gray-800">Eye Disease Detection</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <UserProfile onLogout={handleLogout} />
          </nav>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <p>© {new Date().getFullYear()} Eye Disease Detection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
