/**
 * API Interceptor Utility
 * Handles all API requests with JWT token and error handling
 */
import AuthService from '../services/AuthService';

// Base URL for API - using relative path since we're using a proxy in package.json
const API_BASE_URL = '';

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {string} - The full URL
 */
const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - The fetch promise
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    const response = await AuthService.authFetch(url, options);
    
    if (response.ok) {
      // Check if response is JSON or not
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }
    
    // Handle specific HTTP status codes
    if (response.status === 401) {
      // Unauthorized - token expired or invalid
      AuthService.removeToken();
      window.location.href = '/login';
      throw new Error('Your session has expired. Please login again.');
    }
    
    if (response.status === 403) {
      // Forbidden - insufficient permissions
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (response.status === 404) {
      // Not found
      throw new Error('The requested resource was not found.');
    }
    
    if (response.status === 500) {
      // Server error
      throw new Error('Server error. Please try again later.');
    }
    
    // Generic error handling
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong. Please try again.');
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Make a GET request
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - The fetch promise
 */
const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'GET',
    ...options
  });
};

/**
 * Make a POST request
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - The fetch promise
 */
const post = (endpoint, data, options = {}) => {
  const isFormData = data instanceof FormData;
  
  return apiRequest(endpoint, {
    method: 'POST',
    headers: isFormData ? {} : {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: isFormData ? data : JSON.stringify(data),
    ...options
  });
};

/**
 * Make a PUT request
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - The fetch promise
 */
const put = (endpoint, data, options = {}) => {
  const isFormData = data instanceof FormData;
  
  return apiRequest(endpoint, {
    method: 'PUT',
    headers: isFormData ? {} : {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: isFormData ? data : JSON.stringify(data),
    ...options
  });
};

/**
 * Make a DELETE request
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - The fetch promise
 */
const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options
  });
};

const ApiInterceptor = {
  get,
  post,
  put,
  delete: del
};

export default ApiInterceptor;
