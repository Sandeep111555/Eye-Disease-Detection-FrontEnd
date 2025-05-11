import React, { useState, useRef } from 'react';
import Button from './Button';
import { useAlert } from '../contexts/AlertContext';

const FileUpload = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { error: showError } = useAlert();
  const validateFile = (file) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG or PNG)');
      showError('Please select a valid image file (JPEG or PNG)');
      return false;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please select a smaller image.');
      showError('File size exceeds 5MB limit. Please select a smaller image.');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (validateFile(file)) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Reset if invalid
      setSelectedFile(null);
      setPreview('');
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile, preview);
      // Reset after upload
      setSelectedFile(null);
      setPreview('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept="image/jpeg, image/png, image/jpg" 
          className="hidden" 
        />
        
        {error && (
          <div className="mb-3 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {preview ? (
          <div className="w-full flex flex-col items-center">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 mb-4 rounded" 
            />
            <p className="text-sm text-gray-600 mb-2">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <svg 
              className="w-12 h-12 text-gray-400 mb-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-base text-gray-700 font-medium">Drag and drop your eye image here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            <p className="text-xs text-gray-500 mt-2">Supported formats: JPEG, PNG (max 5MB)</p>
          </>
        )}
      </div>
      
      {selectedFile && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            Analyze Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
