import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Main Brand Animation Container */}
      <div className="relative w-80 h-40 mb-12">
        {/* Elegant Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Subtle radial gradient background */}
          <div className="w-64 h-32 bg-gradient-radial from-blue-50/30 via-transparent to-transparent rounded-full"></div>
        </div>

        {/* Animated Company Name */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Trang Thanh Text with elegant animation */}
            <div className="relative overflow-hidden">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-800 to-blue-600 animate-gradient-x">
                Trang Thanh
              </h1>
              {/* Shimmering effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
            </div>

            {/* Elegant subtitle */}
            <p className="text-sm font-medium text-gray-600 mt-2 tracking-wide animate-fade-in-up">
              TRAVEL COMPANY
            </p>

            {/* Decorative underline */}
            <div className="flex items-center justify-center mt-3">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-400 animate-expand-right"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full mx-3 animate-pulse-elegant"></div>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-blue-400 animate-expand-left"></div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-4 left-8 w-1 h-1 bg-blue-300 rounded-full animate-float-1 opacity-60"></div>
        <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-2 opacity-40"></div>
        <div className="absolute bottom-6 left-16 w-1 h-1 bg-blue-500 rounded-full animate-float-3 opacity-50"></div>
        <div className="absolute bottom-4 right-8 w-1 h-1 bg-blue-300 rounded-full animate-float-1 opacity-30"></div>
      </div>

      {/* Professional Loading Text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 animate-fade-in">
          {message}
        </h3>

        {/* Elegant loading dots */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce-elegant" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full animate-bounce-elegant" style={{ animationDelay: '200ms' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce-elegant" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PlaneLoading;
