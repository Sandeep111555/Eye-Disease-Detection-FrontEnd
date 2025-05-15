/**
 * Service for handling eye disease detection API calls
 */
import ApiInterceptor from '../utils/ApiInterceptor';
import AuthService from './AuthService';

// Helper function to get user ID from JWT token
const getUserId = () => {
  try {
    const token = AuthService.getToken();
    if (!token) {
      console.error('No JWT token found');
      return null;
    }

    // Basic parsing of JWT to get user info
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64));
    
    // Look for common user ID fields in JWT tokens
    if (decodedPayload.id) {
      return decodedPayload.id;
    } else if (decodedPayload.userId) {
      return decodedPayload.userId;
    } else if (decodedPayload.sub) {
      return decodedPayload.sub;
    } else if (decodedPayload.user_id) {
      return decodedPayload.user_id;
    }
    
    console.error('No user ID found in JWT payload:', decodedPayload);
    return null;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Analyze eye image and get results
const analyzeEyeImage = async (imageFile) => {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('file', imageFile); // Changed to 'file' as per FastAPI's UploadFile param name
    
    // Make direct fetch call to the FastAPI endpoint with absolute URL
    // Note: This is an external API, so we're still using direct fetch instead of ApiInterceptor
    const response = await fetch('http://localhost:8000/predict/', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type here, as it's automatically set with the correct boundary for FormData
        'Accept': 'application/json',
      },
      credentials: 'omit', // Change to 'omit' to avoid CORS preflight issues with credentials
      mode: 'cors'
    });

    if (!response.ok) {
      // Try to parse the error response
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error analyzing image: ${response.status} ${response.statusText}`);
        } else {
          const errorText = await response.text();
          throw new Error(errorText || `Error analyzing image: ${response.status} ${response.statusText}`);
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message) {
          throw parseError;
        }
        throw new Error(`Error analyzing image: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // Transform the FastAPI response format to match the frontend's expected format
    const result = {
      diagnosis: data.predicted_class.replace('_', ' '), // Convert snake_case to readable format
      confidence: data.confidence,
      conditions: getAllConditions(data.all_confidence_scores),
      recommendations: getRecommendations(data.predicted_class)
    };
    
    // Store the analysis result in the Java backend
    await storeAnalysisResult(imageFile, data.predicted_class, data.confidence);
    
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

// Store the analysis result in the Java backend
const storeAnalysisResult = async (imageFile, diseaseName, confidence) => {
  try {
    const userId = getUserId();
    if (!userId) {
      console.error('Failed to get user ID from JWT token');
      throw new Error('User ID not found. Please log in again.');
    }
    
    console.log(`Storing analysis for user ID: ${userId}`);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('diseaseName', diseaseName);
    formData.append('confidence', confidence);
    
    // Use ApiInterceptor for consistent error handling
    const responseData = await ApiInterceptor.post(`/files/${userId}`, formData);
    return responseData;
  } catch (error) {
    console.error('Error storing analysis result:', error);
    throw error;
  }
};

const getAllConditions = (all_confidence_scores) => {
  // Convert the object to an array of objects with name and probability
  return Object.keys(all_confidence_scores).map(condition => {
    return { 
      name: condition.replace('_', ' '), 
      probability: all_confidence_scores[condition]
    };
  });
};

// Helper function to generate recommendations based on diagnosis
const getRecommendations = (diagnosis) => {
  switch (diagnosis) {
    case 'cataract':
      return 'Signs of cataract detected. Please consult an ophthalmologist for further evaluation.';
    case 'diabetic_retinopathy':
      return 'Signs of diabetic retinopathy detected. Urgent consultation with an ophthalmologist is recommended.';
    case 'glaucoma':
      return 'Signs of glaucoma detected. Please schedule an appointment with an ophthalmologist for pressure testing.';
    case 'normal':
      return 'Your eye appears healthy. Continue with regular eye check-ups.';
    default:
      return 'Please consult with an eye care professional for a complete evaluation.';
  }
};

// Get user analysis history from Java backend
const getUserAnalysisHistory = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      console.error('Failed to get user ID from JWT token');
      throw new Error('User ID not found. Please log in again.');
    }
    
    console.log(`Fetching analysis history for user ID: ${userId}`);
    
    // Use ApiInterceptor for consistent error handling
    const data = await ApiInterceptor.get(`/files/${userId}`);
      
    // Transform the Java backend response format to match the frontend's expected format
    return data.map(item => ({
      id: item.fileUrl, // Using fileUrl as id since we'll need it for downloading
      date: new Date(item.createdAt || item.uploadDate || Date.now()).toISOString(),
      diagnosis: item.diseaseName.replace('_', ' '),
      confidence: item.confidence,
      fileUrl: item.fileUrl
    }));
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

// Download an eye image from the Java backend
const downloadEyeImage = async (filePath) => {
  try {
    // For binary files, we need to use fetch directly with additional options
    // that are not available in ApiInterceptor
    const token = AuthService.getToken();
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Use proxy configuration from package.json and proper authorization
    const response = await fetch(`/files/filePath/${encodeURIComponent(filePath)}`, {
      method: 'GET',
      headers: {
        'Authorization': bearerToken,
        'Accept': 'application/octet-stream' // Expecting binary file data
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      // Try to parse the error response
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error downloading image: ${response.status} ${response.statusText}`);
        } else {
          const errorText = await response.text();
          throw new Error(errorText || `Error downloading image: ${response.status} ${response.statusText}`);
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message) {
          throw parseError;
        }
        throw new Error(`Error downloading image: ${response.status} ${response.statusText}`);
      }
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filePath.split('/').pop() || 'eye-image.jpg';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

const EyeAnalysisService = {
  analyzeEyeImage,
  getUserAnalysisHistory,
  downloadEyeImage
};

export default EyeAnalysisService;
