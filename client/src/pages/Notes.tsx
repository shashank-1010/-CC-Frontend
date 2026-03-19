import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function Notes() {
  return (
    <DashboardLayout
      title="Notes Sharing"
      subtitle="Share and download subject notes"
      action={
        <button 
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-not-allowed opacity-50"
          disabled
        >
          + Upload Note
        </button>
      }
    >
      {/* Professional Coming Soon with Loading Animation */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-12">
        <div className="max-w-md mx-auto text-center">
          {/* Loading Spinner - Professional */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            {/* Outer ring - subtle */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-100"></div>
            
            {/* Animated ring - red */}
            <div className="absolute inset-0 rounded-full border-2 border-red-600 border-t-transparent animate-spin-slow"></div>
            
            {/* Inner dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse-subtle"></div>
            </div>
          </div>

          {/* Simple Text */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Notes feature coming soon
          </h3>
          
          <p className="text-gray-500 text-sm mb-6">
            We're working on making notes sharing available for everyone.
            <br className="hidden sm:block" />
            Check back in a few days.
          </p>

          {/* Progress bar with loading pulse */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
            <div 
              className="bg-red-600 h-2 rounded-full relative"
              style={{ width: '65%' }}
            >
              {/* Loading pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Loading dots - Minimal */}
          <div className="flex justify-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 bg-red-200 rounded-full animate-loading-dot" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-red-300 rounded-full animate-loading-dot" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-loading-dot" style={{ animationDelay: '300ms' }}></span>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-loading-dot" style={{ animationDelay: '450ms' }}></span>
          </div>

          {/* Simple note */}
          <p className="text-xs text-gray-400">
            Be the first to share notes when we launch
          </p>
        </div>
      </div>

      {/* Preview Cards - Skeleton Loading Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-200 rounded-xl p-4 opacity-40 hover:opacity-60 transition-opacity"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse-slow"></div>
              <div className="w-16 h-6 bg-gray-100 rounded-full animate-pulse-slow"></div>
            </div>
            <div className="h-5 bg-gray-100 rounded w-3/4 mb-2 animate-pulse-slow"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-3 animate-pulse-slow"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-100 rounded flex-1 animate-pulse-slow"></div>
              <div className="h-8 bg-gray-100 rounded w-8 animate-pulse-slow"></div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes loading-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-loading-dot {
          animation: loading-dot 1.2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </DashboardLayout>
  );
}