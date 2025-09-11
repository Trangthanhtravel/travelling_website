import React from 'react';
import Lottie from 'lottie-react';
import animationData from './Loading40_paperplane.json';

interface LottieLoadingProps {
  message?: string;
}

const LottieLoading: React.FC<LottieLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent">
      {/* Lottie Animation */}
      <div className="mb-8 w-80 h-80">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Company Name */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 animate-fade-in" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Trang Thanh
        </h1>
        <p className="text-slate-700 dark:text-gray-200 text-lg mb-2 animate-fade-in-delay" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
          {message}
        </p>
      </div>

      {/* Loading dots indicator */}
      <div className="flex space-x-2 mt-8">
        <div className="w-2 h-2 bg-gray-600/60 dark:bg-white/60 rounded-full animate-bounce-1"></div>
        <div className="w-2 h-2 bg-gray-600/60 dark:bg-white/60 rounded-full animate-bounce-2"></div>
        <div className="w-2 h-2 bg-gray-600/60 dark:bg-white/60 rounded-full animate-bounce-3"></div>
      </div>
    </div>
  );
};

export default LottieLoading;
