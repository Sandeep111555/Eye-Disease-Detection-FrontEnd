import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import eyeLogo from '../assets/images/eye-logo.png';
import eyeScan from '../assets/images/eye-scan.jpg';
import AuthService from '../services/AuthService';
import { useAlert } from '../contexts/AlertContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { error: showError, success } = useAlert();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      showError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    // Call the register API using AuthService
    AuthService.register(formData)
      .then(() => {
        // Registration successful, redirect to login page
        // We'll set a clear flag to indicate this is a new registration
        const registrationMessage = 'Registration successful! Please login with your credentials.';
        
        // Show success message right before navigating
        // But do NOT show it here to avoid duplicate notifications
        
        // Navigate to login with the registration message in state
        navigate('/login', { 
          state: { 
            message: registrationMessage,
            fromRegistration: true
          },
          replace: true // Use replace to avoid browser history stacking
        });
      })
      .catch(err => {
        // Save the error in state for in-form display
        setError(err.message || 'Registration failed. Please try again.');
        // Also display an alert notification for better visibility
        showError(err.message || 'Registration failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              className="mx-auto h-16 w-auto"
              src={eyeLogo}
              alt="Eye Disease Detection"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Register to access eye disease detection services
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="FirstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
            <Input
              label="LastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
            <Input
              label="Username"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            
            <Button
              type="submit"
              className="w-full flex justify-center py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={eyeScan}
          alt="Eye scan visualization"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-60"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-4 text-center">Eye Disease Detection</h1>
          <p className="text-xl text-center max-w-lg">
            Register now to access our AI-powered eye disease detection technology.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
