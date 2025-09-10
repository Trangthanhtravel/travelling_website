import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Main Brand Animation Container */}
      <div className="relative w-96 h-48 mb-16">
        {/* Elegant Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-40 bg-gradient-to-r from-amber-100/20 via-amber-50/30 to-amber-100/20 rounded-full blur-xl"></div>
        </div>

        {/* Animated Company Name */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Trang Thanh Text with proper spacing */}
            <div className="relative mb-4">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 animate-text-glow leading-tight">
                Trang Thanh
              </h1>
              {/* Elegant particles around text */}
              <div className="absolute -top-2 -left-2 w-2 h-2 bg-amber-400 rounded-full animate-particle-1 opacity-70"></div>
              <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-particle-2 opacity-60"></div>
              <div className="absolute -bottom-2 left-1/4 w-1 h-1 bg-amber-500 rounded-full animate-particle-3 opacity-80"></div>
              <div className="absolute -bottom-1 right-1/4 w-1.5 h-1.5 bg-orange-300 rounded-full animate-particle-4 opacity-50"></div>
            </div>

            {/* Elegant subtitle with proper spacing */}
            <div className="relative">
              <p className="text-base font-semibold text-gray-600 tracking-[0.3em] animate-fade-in-delayed uppercase">
                Travel Company
              </p>

              {/* Sophisticated underline decoration */}
              <div className="flex items-center justify-center mt-4 space-x-3">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 animate-line-expand-left"></div>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-dot-pulse-1"></div>
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-dot-pulse-2"></div>
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-dot-pulse-3"></div>
                </div>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 animate-line-expand-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Loading Text */}
      <div className="text-center space-y-6">
        <h3 className="text-xl font-medium text-gray-700 animate-fade-in-message">
          {message}
        </h3>

        {/* Refined loading indicator */}
        <div className="flex items-center justify-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-t from-amber-400 to-amber-600 rounded-full animate-wave-1"></div>
            <div className="w-2.5 h-2.5 bg-gradient-to-t from-orange-400 to-orange-600 rounded-full animate-wave-2"></div>
            <div className="w-2.5 h-2.5 bg-gradient-to-t from-amber-400 to-amber-600 rounded-full animate-wave-3"></div>
            <div className="w-2.5 h-2.5 bg-gradient-to-t from-orange-400 to-orange-600 rounded-full animate-wave-4"></div>
            <div className="w-2.5 h-2.5 bg-gradient-to-t from-amber-400 to-amber-600 rounded-full animate-wave-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaneLoading;
