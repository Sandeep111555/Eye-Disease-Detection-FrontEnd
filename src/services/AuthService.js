/**
 * Authentication service for handling JWT token and API calls
 */

// API base URL - using relative path since we're using a proxy in package.json
const API_BASE_URL = '';

// Store JWT token in localStorage
const setToken = (token) => {
  // Make sure the token doesn't have 'Bearer ' prefix before storing
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  localStorage.setItem('jwt_token', cleanToken);
  localStorage.setItem('isAuthenticated', 'true');
};

// Remove JWT token from localStorage
const removeToken = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('isAuthenticated');
};

// Get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('jwt_token');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true' && !!getToken();
};

// Login user with username and password
const login = async (username, password) => {
  // Create Basic Authentication header
  const credentials = btoa(`${username}:${password}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': '*/*' // Accept any content type
      },
      credentials: 'include', // Include cookies if your API uses cookie-based authentication
      mode: 'cors' // Explicitly request CORS mode
    });
    
    if (!response.ok) {
      // Try to get a more specific error message
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Invalid username or password');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Invalid username or password');
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message) {
          throw parseError;
        }
        throw new Error('Invalid username or password');
      }
    }
    
    // Check content type to determine how to handle the response
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        // If it's JSON, parse it as JSON
        const data = await response.json();
        // Check if token exists in the response data
        if (data.token) {
          // Store token without Bearer prefix
          setToken(data.token);
        } else if (data.access_token) {
          // Some APIs use access_token instead of token
          setToken(data.access_token);
        } else {
          console.error('No token found in JSON response:', data);
          throw new Error('Authentication failed: No token received');
        }
        return data;
      } else {
        // If it's not JSON, assume it's the raw token as text
        const token = await response.text();
        // Remove Bearer prefix if present and store only the token
        setToken(token);
        return { token };
      }
    } catch (error) {
      console.error('Error processing authentication response:', error);
      throw new Error('Failed to process authentication response');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.message.includes('Unexpected token')) {
      throw new Error('Server response format error. Please contact support.');
    }
    throw error;
  }
};

// Register new user
const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      credentials: 'include', // Include cookies if your API uses cookie-based authentication
      mode: 'cors', // Explicitly request CORS mode
      body: JSON.stringify({...userData})
    });

    if (!response.ok) {
      // Try to get more specific error message from the server
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout user
const logout = () => {
  removeToken();
};

// Validate token with backend (mock implementation since we don't have a real API)
const validateToken = async () => {
  const token = getToken();
  if (!token) return false;

  // Since we don't have a real validate-token endpoint, we'll just check if the token exists
  return !!token;
};

// Create authenticated API request with JWT token
const authFetch = async (url, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Ensure the token doesn't already have 'Bearer ' prefix before adding it
  const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': bearerToken,
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };

  try {
    const response = await fetch(url, authOptions);
    
    if (response.status === 401) {
      // Try to get the response content to check if it's a password-related error
      let responseText;
      try {
        // First try to get it as JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          responseText = errorData.message || '';
        } else {
          responseText = await response.text();
        }
      } catch (e) {
        responseText = await response.text().catch(() => '');
      }
      
      // If it contains "password", it's likely a password validation error
      if (responseText && responseText.toLowerCase().includes('password')) {
        return response;
      }
      
      // Otherwise it's a token expiration
      removeToken();
      throw new Error('Session expired. Please login again.');
    }
    
    return response;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

const AuthService = {
  login,
  register,
  logout,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  validateToken,
  authFetch
};

export default AuthService;
