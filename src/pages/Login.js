import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import FormField from '../components/FormField';
import FormGroup from '../components/FormGroup';
import FormSection from '../components/FormSection';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import Card from '../components/Card';
import eyeLogo from '../assets/images/eye-logo.png';
import eyeScan from '../assets/images/eye-scan.jpg';
import AuthService from '../services/AuthService';
import { useAlert } from '../contexts/AlertContext';
import { isValidEmail } from '../utils/ValidationUtils';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError, success, validation } = useAlert();
  
  useEffect(() => {
    // Check if there's a registration success message
    if (location.state && location.state.message) {
      // Set the success message in the component state
      setSuccessMessage(location.state.message);
      
      // Only show the alert if it's coming directly from registration
      if (location.state.fromRegistration === true) {
        // Show toast notification
        success(location.state.message); 
      }
      
      // Clear the location state to prevent the message from reappearing
      // This will run regardless of fromRegistration value
      window.history.replaceState({}, document.title);
    }

    // Check if user is already authenticated via JWT
    const checkAuth = async () => {
      const isValid = await AuthService.validateToken();
      if (isValid) {
        navigate('/dashboard');
      } else {
        // If token is invalid, remove it
        AuthService.removeToken();
      }
    };

    if (AuthService.isAuthenticated()) {
      checkAuth();
    }
  }, [navigate, location, success]);
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    
    if (!isValid) {
      validation('Please fix the validation errors to continue');
    }
    
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
    
    // Clear general error message when user makes changes
    if (error) {
      setError('');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    AuthService.login(formData.email, formData.password)
      .then(() => {
        success('Login successful!');
        navigate('/dashboard');
      })
      .catch(err => {
        // Save the error in state for in-form display
        setError(err.message || 'Login failed. Please check your credentials.');
        // Also display an alert notification for better visibility
        showError(err.message || 'Login failed. Please check your credentials.');
        
        // Reset password field on error for security
        setFormData({
          ...formData,
          password: ''
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              className="mx-auto h-16 w-auto"
              src={eyeLogo}
              alt="Eye Disease Detection"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>
            {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {successMessage}
            </div>
          )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Card className="p-6">
              <FormSection
                title="Sign In"
                description="Access your account"
                borderless
              >
                <FormGroup>
                  <FormField
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    error={validationErrors.email}
                    isValid={!validationErrors.email && formData.email.length > 0}
                    showValidation={true}
                    helpText="We'll never share your email"
                  />
                  
                  <PasswordInput
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    error={validationErrors.password}
                    showStrengthMeter={false}
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        Forgot your password?
                      </a>
                    </div>
                  </div>
                </FormGroup>
              </FormSection>
            </Card>
            
            <Button
              type="submit"
              className="w-full flex justify-center py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
              
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
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
            Upload your eye images and get instant analysis powered by advanced AI technology.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
