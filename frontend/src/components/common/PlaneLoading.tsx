import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      {/* Simple Loading Spinner */}
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      {/* Company Name */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Trang Thanh
        </h1>
        <p className="text-gray-600 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
};

export default PlaneLoading;
