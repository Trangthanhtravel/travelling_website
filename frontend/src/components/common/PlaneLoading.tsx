import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Plane Animation Container */}
      <div className="relative w-64 h-32 mb-8">
        {/* Flight Path */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"></div>
        </div>

        {/* Animated Plane */}
        <div className="absolute top-1/2 transform -translate-y-1/2 animate-plane-fly">
          <div className="relative">
            {/* Plane SVG */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-600 drop-shadow-lg"
            >
              <path
                d="M20.56 3.44C21.15 4.03 21.15 4.97 20.56 5.56L14.5 11.62L18.5 15.62C19.28 16.4 19.28 17.65 18.5 18.43C17.72 19.21 16.47 19.21 15.69 18.43L11.69 14.43L5.63 20.49C5.04 21.08 4.1 21.08 3.51 20.49C2.92 19.9 2.92 18.96 3.51 18.37L9.57 12.31L5.57 8.31C4.79 7.53 4.79 6.28 5.57 5.5C6.35 4.72 7.6 4.72 8.38 5.5L12.38 9.5L18.44 3.44C19.03 2.85 19.97 2.85 20.56 3.44Z"
                fill="currentColor"
              />
            </svg>

            {/* Plane Trail */}
            <div className="absolute top-1/2 -left-8 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: '200ms' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-ping" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Clouds */}
        <div className="absolute top-2 left-4 animate-cloud-float">
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" className="text-gray-300">
            <path
              d="M6 14C3.79 14 2 12.21 2 10S3.79 6 6 6C6.35 4.36 7.79 3 9.5 3C11.64 3 13.36 4.22 13.83 6H14C16.21 6 18 7.79 18 10S16.21 14 14 14H6Z"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="absolute top-6 right-8 animate-cloud-float-delayed">
          <svg width="20" height="14" viewBox="0 0 24 16" fill="none" className="text-gray-200">
            <path
              d="M6 14C3.79 14 2 12.21 2 10S3.79 6 6 6C6.35 4.36 7.79 3 9.5 3C11.64 3 13.36 4.22 13.83 6H14C16.21 6 18 7.79 18 10S16.21 14 14 14H6Z"
              fill="currentColor"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {message}
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PlaneLoading;
