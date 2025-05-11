import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import EyeAnalysisService from '../services/EyeAnalysisService';
import { useAlert } from '../contexts/AlertContext';

const AnalysisHistory = ({ history = [], onViewDetail }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useAlert();

  if (history.length === 0) {
    return (
      <Card title="Analysis History">
        <div className="flex flex-col items-center justify-center py-8 text-center">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Analysis History</h3>
          <p className="text-gray-500">Your analysis history will appear here</p>
        </div>
      </Card>
    );
  }
  const handleViewDetail = async (analysisId) => {
    setIsLoading(true);
    try {
      // Since we don't have a real API for details, we'll create mock data based on history item
      const historyItem = history.find(item => item.id === analysisId);
      
      if (!historyItem) {
        throw new Error('Analysis not found');
      }
      
      // Create mock detail data based on the history item
      const mockDetailData = {
        diagnosis: historyItem.diagnosis,
        confidence: historyItem.confidence,
        conditions: [
          { name: historyItem.diagnosis, probability: historyItem.confidence },
          ...getMockConditions(historyItem.diagnosis)
        ],
        recommendations: getMockRecommendation(historyItem.diagnosis)
      };
      
      onViewDetail(mockDetailData);
    } catch (err) {
      console.error('Error creating analysis details:', err);
      error('Failed to load analysis details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to generate mock conditions
  const getMockConditions = (mainDiagnosis) => {
    const allConditions = ['Cataract', 'Diabetic Retinopathy', 'Glaucoma', 'Normal'];
    const otherConditions = allConditions.filter(c => 
      c.toLowerCase() !== mainDiagnosis.toLowerCase()
    );
    
    return otherConditions.map(condition => {
      const probability = Math.floor(Math.random() * 5) + 1; // Random 1-5%
      return { name: condition, probability };
    });
  };
  
  // Helper function to generate mock recommendations
  const getMockRecommendation = (diagnosis) => {
    switch(diagnosis.toLowerCase()) {
      case 'cataract':
        return 'Signs of cataract detected. Please consult an ophthalmologist for further evaluation.';
      case 'diabetic retinopathy':
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

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card title="Analysis History">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.date)}
                </td>                <td className="px-4 py-3 whitespace-nowrap">
                  <span 
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.diagnosis === 'Normal' || item.diagnosis === 'normal'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.diagnosis}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{item.confidence}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <Button 
                    onClick={() => handleViewDetail(item.id)}
                    className="py-1 px-3 text-xs"
                    disabled={isLoading}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AnalysisHistory;
