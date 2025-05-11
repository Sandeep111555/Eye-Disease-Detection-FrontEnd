/**
 * Service for handling eye disease detection API calls
 */
import ApiInterceptor from '../utils/ApiInterceptor';
import AuthService from './AuthService';

// Analyze eye image and get results
const analyzeEyeImage = async (imageFile) => {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('file', imageFile); // Changed to 'file' as per FastAPI's UploadFile param name    // Make direct fetch call to the FastAPI endpoint with absolute URL
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
      throw new Error(`Error analyzing image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
      // Transform the FastAPI response format to match the frontend's expected format
    return {
      diagnosis: data.predicted_class.replace('_', ' '), // Convert snake_case to readable format
      confidence: data.confidence,
      conditions: getAllConditions(data.all_confidence_scores),
      recommendations: getRecommendations(data.predicted_class)
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
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

// Get mock analysis history (since FastAPI doesn't provide this endpoint)
const getUserAnalysisHistory = async () => {
  // Mock data since the FastAPI backend doesn't provide a history endpoint
  return [
    { 
      id: '1', 
      date: new Date().toISOString().split('T')[0], 
      diagnosis: 'Normal', 
      confidence: 92 
    },
    { 
      id: '2', 
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      diagnosis: 'Cataract', 
      confidence: 78 
    }
  ];
};

const EyeAnalysisService = {
  analyzeEyeImage,
  getUserAnalysisHistory
};

export default EyeAnalysisService;
