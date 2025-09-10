import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-50/50 to-blue-50/30">
      {/* Main Brand Animation Container */}
      <div className="relative w-96 h-64 mb-12">
        {/* Elegant Background Compass */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-amber-200/40 rounded-full animate-compass-rotate relative">
            {/* Compass Points */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-amber-500 to-amber-600"></div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-t from-amber-400 to-amber-500"></div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-gradient-to-l from-amber-400 to-amber-500"></div>

            {/* Inner compass circle */}
            <div className="absolute inset-4 border border-amber-300/30 rounded-full"></div>
          </div>
        </div>

        {/* Floating Travel Icons */}
        <div className="absolute inset-0">
          {/* Airplane */}
          <div className="absolute top-8 left-16 animate-float-airplane">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>

          {/* Mountain */}
          <div className="absolute top-12 right-20 animate-float-mountain">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22l-9-12z"/>
            </svg>
          </div>

          {/* Luggage */}
          <div className="absolute bottom-16 left-20 animate-float-luggage">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 6h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9.5 18H8V9h1.5v9zm3.25 0h-1.5V9h1.5v9zm3.25 0H14V9h1.5v9zm-3.25-15h1V5h-1V3z"/>
            </svg>
          </div>

          {/* Camera */}
          <div className="absolute bottom-12 right-16 animate-float-camera">
            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15.5c1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5-3.5 1.57-3.5 3.5 1.57 3.5 3.5 3.5zm4.5-9H15l-1-1h-4l-1 1H7.5c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z"/>
            </svg>
          </div>
        </div>

        {/* Company Name with Modern Typography */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Trang Thanh Text with elegant animation */}
            <div className="relative mb-3">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 animate-brand-glow tracking-wide">
                Trang Thanh
              </h1>

              {/* Subtle underlining effect */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 animate-underline-expand"></div>
            </div>

            {/* Professional subtitle */}
            <div className="relative">
              <p className="text-sm font-medium text-slate-600 tracking-[0.2em] animate-subtitle-fade uppercase">
                Premium Travel Experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Message and Progress */}
      <div className="text-center space-y-6">
        <h3 className="text-lg font-medium text-slate-700 animate-message-fade">
          {message}
        </h3>

        {/* Modern Loading Indicator */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gradient-to-t from-amber-400 to-amber-500 rounded-full animate-loading-dot-1"></div>
            <div className="w-2 h-2 bg-gradient-to-t from-blue-400 to-blue-500 rounded-full animate-loading-dot-2"></div>
            <div className="w-2 h-2 bg-gradient-to-t from-emerald-400 to-emerald-500 rounded-full animate-loading-dot-3"></div>
            <div className="w-2 h-2 bg-gradient-to-t from-purple-400 to-purple-500 rounded-full animate-loading-dot-4"></div>
            <div className="w-2 h-2 bg-gradient-to-t from-orange-400 to-orange-500 rounded-full animate-loading-dot-5"></div>
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-xs text-slate-500 animate-progress-text">
          Preparing your journey...
        </div>
      </div>
    </div>
  );
};

export default PlaneLoading;
