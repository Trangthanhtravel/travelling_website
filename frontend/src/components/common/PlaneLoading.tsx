import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent">
      {/* Flying Plane Animation */}
      <div className="relative mb-12 w-96 h-32">
        {/* Flight Path */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

        {/* Flying Plane */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 animate-plane-fly">
          <svg className="w-16 h-16 text-white drop-shadow-lg transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>

          {/* Plane Trail */}
          <div className="absolute top-1/2 -left-8 w-8 h-px bg-gradient-to-l from-blue-400/60 to-transparent transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 -left-12 w-4 h-px bg-gradient-to-l from-blue-300/40 to-transparent transform -translate-y-1/2"></div>
        </div>
      </div>

      {/* Company Name */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4 animate-fade-in">
          Trang Thanh
        </h1>
        <p className="text-white/80 text-lg drop-shadow-md animate-fade-in-delay">
          {message}
        </p>
      </div>

      {/* Flying dots indicator */}
      <div className="flex space-x-2 mt-8">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-1"></div>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-2"></div>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-3"></div>
      </div>
    </div>
  );
};

export default PlaneLoading;
