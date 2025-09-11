import React from 'react';

interface PlaneLoadingProps {
  message?: string;
}

const PlaneLoading: React.FC<PlaneLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent">
      {/* Sky background with clouds */}
      <div className="relative mb-16 w-[500px] h-48 overflow-hidden rounded-lg bg-gradient-to-b from-blue-400/20 to-blue-200/10">
        {/* Background clouds */}
        <div className="absolute top-4 left-10 w-16 h-8 bg-white/30 rounded-full animate-cloud-float"></div>
        <div className="absolute top-8 right-20 w-12 h-6 bg-white/25 rounded-full animate-cloud-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-12 left-32 w-10 h-5 bg-white/20 rounded-full animate-cloud-float" style={{ animationDelay: '4s' }}></div>

        {/* Flight Path */}
        <div className="absolute top-24 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

        {/* Runway/Ground */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-green-300/20 to-transparent"></div>
        <div className="absolute bottom-2 left-0 w-full h-2 bg-gray-400/30"></div>

        {/* Flying Plane - Side View */}
        <div className="absolute top-20 left-0 transform -translate-y-1/2 animate-plane-takeoff">
          <div className="relative w-24 h-12">
            {/* Main Fuselage */}
            <div className="absolute top-2 left-2 w-20 h-6 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full shadow-lg border border-gray-400/50">
              {/* Cockpit */}
              <div className="absolute top-0 left-0 w-8 h-6 bg-gradient-to-r from-blue-200 to-blue-100 rounded-l-full border-r border-gray-300"></div>

              {/* Windows */}
              <div className="absolute top-1 left-10 w-2 h-1.5 bg-blue-300/80 rounded-sm"></div>
              <div className="absolute top-1 left-13 w-2 h-1.5 bg-blue-300/80 rounded-sm"></div>
              <div className="absolute top-1 left-16 w-2 h-1.5 bg-blue-300/80 rounded-sm"></div>

              {/* Door */}
              <div className="absolute top-0.5 left-8 w-1 h-4 bg-gray-400/60 rounded-sm"></div>
            </div>

            {/* Main Wings */}
            <div className="absolute top-4 left-6 w-16 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-sm shadow-md transform -rotate-2">
              {/* Wing details */}
              <div className="absolute top-0 right-2 w-3 h-2 bg-red-400 rounded-sm"></div>
              <div className="absolute top-0 right-6 w-2 h-2 bg-blue-400 rounded-sm"></div>
            </div>

            {/* Tail */}
            <div className="absolute top-1 right-0 w-3 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-r-sm shadow-md">
              <div className="absolute top-1 left-0 w-3 h-2 bg-red-400 rounded-sm"></div>
            </div>

            {/* Landing Gear */}
            <div className="absolute bottom-0 left-8 w-1 h-3 bg-gray-600 rounded-sm">
              <div className="absolute bottom-0 left-0 w-2 h-1 bg-black rounded-full transform -translate-x-0.5"></div>
            </div>
            <div className="absolute bottom-0 left-14 w-1 h-3 bg-gray-600 rounded-sm">
              <div className="absolute bottom-0 left-0 w-2 h-1 bg-black rounded-full transform -translate-x-0.5"></div>
            </div>

            {/* Engine */}
            <div className="absolute top-5 left-12 w-4 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-md">
              <div className="absolute top-1 left-0 w-4 h-1 bg-orange-400/80 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Plane Trail/Exhaust */}
          <div className="absolute top-1/2 -left-12 w-12 h-0.5 bg-gradient-to-l from-orange-400/60 to-transparent transform -translate-y-1/2 animate-trail-fade"></div>
          <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-gradient-to-l from-blue-400/60 to-transparent transform -translate-y-1/2 animate-trail-fade" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 -left-16 w-6 h-px bg-gradient-to-l from-gray-300/40 to-transparent transform -translate-y-1/2 animate-trail-fade" style={{ animationDelay: '1s' }}></div>
        </div>
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

      {/* Flying dots indicator */}
      <div className="flex space-x-2 mt-8">
        <div className="w-2 h-2 bg-gray-600/60 dark:bg-white/60 rounded-full animate-bounce-1"></div>
        <div className="w-2 h-2 bg-gray-600/60 dark:bg-white/60 rounded-full animate-bounce-2"></div>
        <div className="w-2 h-2 bg-gray-600/60 dark:bg-white/60 rounded-full animate-bounce-3"></div>
      </div>
    </div>
  );
};

export default PlaneLoading;
