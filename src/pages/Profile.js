import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthService from '../services/AuthService';
import ApiInterceptor from '../utils/ApiInterceptor';
import { useAlert } from '../contexts/AlertContext';

const Profile = () => {
  const [userData, setUserData] = useState({
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
  const navigate = useNavigate();
  const { success, error: showError } = useAlert();  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Define fetchUserProfile inside useEffect to avoid dependency issues
    const fetchUserProfile = async () => {
      try {
      setIsLoading(true);
      // Try to fetch the user profile with the token
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the API interceptor which will automatically add the Authorization header
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
    
    // Call the function
    fetchUserProfile();
  }, [navigate, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName
      };
      
      // Add password fields only if user is changing password
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Call the real API to update the profile
      const updatedProfile = await ApiInterceptor.put('/users/profile', updateData);
      
      // Update local state with the response from the server
      setUserData(updatedProfile);
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setIsEditing(false);
      success('Profile updated successfully');
    } catch (err) {
      showError(err.message || 'Failed to update profile');
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
            <form onSubmit={handleSubmit} className="space-y-6">              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Input
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div><div className="md:col-span-2">
                  <Input
                    label="Username"
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <hr className="my-6" />

              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div>              <div className="flex justify-between items-center mb-6">
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
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>

              <div className="border-t border-gray-200 pt-6">
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
            </div>
          )}
        </Card>

        <div className="mt-8">
          <Card title="Account Security" className="bg-blue-50">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-blue-800">Secure Your Account</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    For better security, use a strong password and change it regularly.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-blue-800">Privacy Protection</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Your eye images and analysis data are securely stored and only accessible to you.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
