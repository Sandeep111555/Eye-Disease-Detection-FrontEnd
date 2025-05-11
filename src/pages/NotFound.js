import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl font-medium text-gray-800 mt-4 mb-6">Page Not Found</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button className="px-8">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
