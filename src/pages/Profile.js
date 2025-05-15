import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import FormField from '../components/FormField';
import FormGroup from '../components/FormGroup';
import FormSection from '../components/FormSection';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import AuthService from '../services/AuthService';
import ApiInterceptor from '../utils/ApiInterceptor';
import { useAlert } from '../contexts/AlertContext';
import { validatePasswordStrength, passwordsMatch, validateName } from '../utils/ValidationUtils';

const Profile = () => {  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { success, error: showError, validation } = useAlert();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user profile data
    fetchUserProfile();
  }, [navigate, showError]);
  
  // Define fetchUserProfile to get user data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Use ApiInterceptor for consistent error handling
      const data = await ApiInterceptor.get('/users/profile');
      
      // If successful, update the user data
      setUserData(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        userName: data.userName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      showError('Could not load profile data. Please try again later.');
      
      // Redirect to login if unauthorized
      if (err.message && (err.message.includes('unauthorized') || err.message.includes('token'))) {
        AuthService.removeToken();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  // Check if password fields are valid for submission
  const isPasswordChangeValid = () => {
    // If user started typing in any password field
    const isChangingPassword = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    
    if (isChangingPassword) {
      // All password fields must be filled
      return formData.currentPassword && formData.newPassword && formData.confirmPassword;
    }
    
    // If not changing password, return true (no validation needed)
    return true;
  };
  // Helper to determine if user is attempting to change password
  const isAttemptingPasswordChange = () => {
    return Boolean(formData.currentPassword || formData.newPassword || formData.confirmPassword);
  };
  
  // Validate profile information
  const validateProfileInfo = () => {
    const errors = {};
    let isValid = true;
    
    // Validate first name if provided
    if (formData.firstName) {
      const nameValidation = validateName(formData.firstName);
      if (!nameValidation.isValid) {
        errors.firstName = nameValidation.message;
        isValid = false;
      }
    }
    
    // Validate last name if provided
    if (formData.lastName) {
      const nameValidation = validateName(formData.lastName);
      if (!nameValidation.isValid) {
        errors.lastName = nameValidation.message;
        isValid = false;
      }
    }
    
    return { isValid, errors };
  };
    // Enhanced password validation with more detailed checks using ValidationUtils
  const validatePassword = () => {
    // If not changing password, no validation needed
    if (!isAttemptingPasswordChange()) {
      return { valid: true, errors: {} };
    }
    
    const errors = {};
    
    // Check if current password is provided
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    // Validate new password strength
    if (formData.newPassword) {
      const passwordValidation = validatePasswordStrength(formData.newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.message;
      }
    } else {
      errors.newPassword = 'New password is required';
    }
    
    // Check if passwords match
    if (formData.newPassword) {
      const matchValidation = passwordsMatch(formData.newPassword, formData.confirmPassword);
      if (!matchValidation.isValid) {
        errors.confirmPassword = matchValidation.message;
      }
    } else if (formData.confirmPassword) {
      // If confirm password is provided but new password is not
      errors.confirmPassword = 'Please enter new password first';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset validation errors before validation
    setValidationErrors({});

    // Validate profile information
    const profileValidation = validateProfileInfo();
    if (!profileValidation.isValid) {
      setValidationErrors(profileValidation.errors);
      validation('Please fix the validation errors in your profile information');
      return;
    }

    // Validate passwords with enhanced validation
    if (isAttemptingPasswordChange()) {
      const { valid, errors } = validatePassword();
      if (!valid) {
        setValidationErrors(errors);
        
        // Show the most important error message
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) {
          validation(errorMessages[0]);
        }
        return;
      }
    }
    
    try {
      setIsLoading(true);
      
      // Prepare update data for the PATCH request
      const updateData = {
        userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      // Add password fields only if user is changing password
      if (formData.currentPassword && formData.newPassword) {
        updateData.oldPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Use ApiInterceptor for consistent error handling
      const responseData = await ApiInterceptor.patch('/users/update', updateData);
      
      // Success message
      const successMessage = responseData.message || 'Profile updated successfully';
      success(successMessage);
      
      // Update local state with the form data
      setUserData({
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Reset password fields and validation errors
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setValidationErrors({});
      
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      
      // Handle password validation errors
      if (err.message && err.message.toLowerCase().includes('password')) {
        // Set a specific validation error for the current password field
        setValidationErrors({
          ...validationErrors,
          currentPassword: err.message
        });
        showError(err.message);
        return;
      }
      
      // Display the error message from the API response for other errors
      const errorMessage = err.message || 'Failed to update profile. Please try again later.';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to determine if a password field needs highlighting
  const shouldHighlightPasswordField = (field) => {
    switch (field) {
      case 'currentPassword':
        return (formData.newPassword || formData.confirmPassword) && !formData.currentPassword;
      case 'newPassword':
        return (formData.currentPassword || formData.confirmPassword) && !formData.newPassword;
      case 'confirmPassword':
        return (formData.currentPassword || formData.newPassword) && !formData.confirmPassword;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <Card>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormSection
                title="Personal Information"
                description="Update your personal details"
                borderless
              >
                <FormGroup layout="grid" columns={2}>
                  <FormField
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    showValidation={true}
                    isValid={formData.firstName.length > 0}
                  />
                  
                  <FormField
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    showValidation={true}
                    isValid={formData.lastName.length > 0}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormField
                    label="Username"
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    disabled={true}
                    helpText="Username cannot be changed"
                  />
                </FormGroup>
              </FormSection>

              <hr className="my-6" />

              <FormSection
                title="Change Password"
                description="Update your password to keep your account secure"
                borderless
              >
                {isAttemptingPasswordChange() && !isPasswordChangeValid() && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <p className="text-sm text-yellow-700">
                      All password fields must be filled to update your password
                    </p>
                  </div>
                )}
                
                <FormGroup>
                  <PasswordInput
                    label="Current Password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                    error={validationErrors.currentPassword}
                    className={shouldHighlightPasswordField('currentPassword') ? "border-red-300" : ""}
                  />
                </FormGroup>
                
                <FormGroup layout="grid" columns={2}>
                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    error={validationErrors.newPassword}
                    className={shouldHighlightPasswordField('newPassword') ? "border-red-300" : ""}
                    showStrengthMeter={true}
                    showRequirements={true}
                    validateOnChange={true}
                  />
                  
                  <PasswordInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    error={validationErrors.confirmPassword}
                    className={shouldHighlightPasswordField('confirmPassword') ? "border-red-300" : ""}
                  />
                </FormGroup>
              </FormSection>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !isPasswordChangeValid()}
                  title={!isPasswordChangeValid() && isAttemptingPasswordChange() ? 
                    "Please fill out all password fields to change your password" : ""}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                    {userData.firstName?.charAt(0).toUpperCase() || userData.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {userData.firstName && userData.lastName 
                        ? `${userData.firstName} ${userData.lastName}` 
                        : userData.userName}
                    </h2>
                    <p className="text-gray-500">{userData.userName}</p>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)} className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  Edit Profile
                </Button>
              </div>

              <FormSection 
                title="Personal Information" 
                description="Your account details"
                borderless
              >
                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Username</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{userData.userName}</dd>
                    </div>
                    <div className="py-4 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">First Name</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{userData.firstName || 'Not set'}</dd>
                    </div>
                    <div className="py-4 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{userData.lastName || 'Not set'}</dd>
                    </div>
                    <div className="py-4 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{formatDate(userData.createdAt)}</dd>
                    </div>
                  </dl>
                </div>
              </FormSection>
            </div>
          )}
        </Card>        <div className="mt-8">
          <Card>
            <FormSection
              title="Account Security"
              description="Tips for keeping your account secure"
              bordered
            >
              <div className="space-y-4 py-2">
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-blue-800">Secure Your Account</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      For better security, use a strong password that includes uppercase letters, lowercase letters, numbers, and special characters. Change your password regularly for optimal security.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-green-800">Privacy Protection</h3>
                    <p className="mt-1 text-sm text-green-700">
                      Your eye images and analysis data are securely stored with encryption and are only accessible to you. We follow strict data protection protocols to ensure your medical information remains private.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-purple-800">Data Handling</h3>
                    <p className="mt-1 text-sm text-purple-700">
                      You control your data. You can download or delete your eye scan history at any time from the dashboard. Your personal information is never shared with third parties without your explicit consent.
                    </p>
                  </div>
                </div>
              </div>
            </FormSection>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
