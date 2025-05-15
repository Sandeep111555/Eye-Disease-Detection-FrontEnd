import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import AnalysisHistory from '../components/AnalysisHistory';
import AuthService from '../services/AuthService';
import EyeAnalysisService from '../services/EyeAnalysisService';
import { useAlert } from '../contexts/AlertContext';
import { validateImageFile } from '../utils/ValidationUtils';

const Dashboard = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError, info } = useAlert();  useEffect(() => {
    // Check if user is authenticated using AuthService
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Load user's analysis history
    fetchAnalysisHistory();
  }, [navigate]);  // Fetch user's analysis history from Java backend with enhanced error handling
  const fetchAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      
      // Use a timeout promise to prevent infinite loading if the request takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
      });
      
      // Race the actual request against the timeout
      const history = await Promise.race([
        EyeAnalysisService.getUserAnalysisHistory(),
        timeoutPromise
      ]);
      
      // Process the history data
      if (Array.isArray(history)) {
        setAnalysisHistory(history);
      } else {
        console.warn('History is not an array:', history);
        setAnalysisHistory([]);
      }
    } catch (err) {
      console.error('Error fetching analysis history:', err);
      
      // Provide specific error messages based on error type
      if (err.message === 'Request timeout') {
        showError('Request timed out while loading history. The server may be experiencing high load.');
      } else if (err.message && err.message.includes('network')) {
        showError('Network error while loading history. Please check your connection.');
      } else if (err.message && err.message.includes('unauthorized')) {
        showError('Your session has expired. Please login again.');
        // Redirect to login if unauthorized
        AuthService.removeToken();
        navigate('/login');
        return;
      } else {
        showError('Failed to load analysis history. Please try again later.');
      }
      
      // Set empty history if API fails
      setAnalysisHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved file upload handler with enhanced validation and error feedback
  const handleFileUpload = (file, preview) => {
    // Reset the current analysis state before starting a new one
    setAnalysisResult(null);
    
    // Validate the uploaded file using ValidationUtils
    const fileValidation = validateImageFile(file);
    if (!fileValidation.isValid) {
      showError(fileValidation.message);
      return;
    }

    // All validations passed, proceed with upload
    setUploadedImage(file);
    setImagePreview(preview);
    
    // Show loading state
    setIsAnalyzing(true);
    info('Analyzing your eye image...', 2000);

    // Use the EyeAnalysisService to analyze the image with enhanced error handling
    EyeAnalysisService.analyzeEyeImage(file)
      .then(data => {
        if (!data) {
          throw new Error('No analysis data received from server');
        }
        
        // Store the analysis result
        setAnalysisResult(data);
        success('Analysis complete!');
        
        // Refresh history after successful analysis
        fetchAnalysisHistory();
      })
      .catch(err => {
        console.error('Error analyzing image:', err);
        
        // Categorize and display specific error messages based on error type
        if (err.message && err.message.includes('network')) {
          showError('Network error. Please check your internet connection and try again.');
        } else if (err.message && err.message.includes('timeout')) {
          showError('Analysis timed out. The server might be busy, please try again later.');
        } else if (err.message && err.message.includes('format')) {
          showError('The image format cannot be processed. Please try a different image.');
        } else if (err.message) {
          // If server provided a specific error message
          showError(err.message);
        } else {
          // Generic fallback message
          showError('An unexpected error occurred during image analysis. Please try again.');
        }
        
        // Reset the analysis result
        setAnalysisResult(null);
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
  };

  const handleNewScan = () => {
    setUploadedImage(null);
    setImagePreview('');
    setAnalysisResult(null);
  };
  const handleViewDetail = (detailData) => {
    setAnalysisResult(detailData);
    // Scroll to the top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Eye Disease Detection Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card title="Upload Eye Image">
            <FileUpload onFileUpload={handleFileUpload} />
          </Card>
          
          {/* Results Section */}
          <Card title="Analysis Results">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-lg text-gray-700">Analyzing your eye image...</p>
              </div>            ) : analysisResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Diagnosis:</h3>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.diagnosis === 'normal' || analysisResult.diagnosis === 'Normal' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {analysisResult.diagnosis.charAt(0).toUpperCase() + analysisResult.diagnosis.slice(1)}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Confidence Score</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${analysisResult.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-gray-600 mt-1">{analysisResult.confidence}%</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Possible Conditions</h4>
                  <div className="space-y-2">
                    {analysisResult.conditions.map((condition, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{condition.name}</span>
                        <span className="text-sm font-medium">{condition.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Recommendations</h4>
                  <p className="text-gray-700">{analysisResult.recommendations}</p>
                </div>
                
                <Button 
                  onClick={handleNewScan}
                  className="w-full mt-4"
                >
                  Start New Scan
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg 
                  className="w-16 h-16 text-gray-400 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Analysis Results</h3>
                <p className="text-gray-500">Upload an eye image to get analysis results</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Image Preview Section */}
        {imagePreview && (
          <div className="mt-8">
            <Card title="Image Preview">
              <div className="flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Uploaded eye" 
                  className="max-h-64 rounded-lg" 
                />
              </div>
            </Card>
          </div>
        )}

        {/* Analysis History Section */}
        <div className="mt-8">
          <AnalysisHistory 
            history={analysisHistory} 
            onViewDetail={handleViewDetail} 
          />
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-blue-50 border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-blue-800">How It Works</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Our AI analyzes your eye images to detect signs of common eye diseases and conditions.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-green-50 border border-green-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-green-800">Privacy First</h3>
                <p className="mt-1 text-sm text-green-700">
                  Your images are securely processed and never shared with third parties.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-purple-50 border border-purple-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-purple-800">Medical Support</h3>
                <p className="mt-1 text-sm text-purple-700">
                  Our tool is designed to support, not replace, professional medical advice.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
