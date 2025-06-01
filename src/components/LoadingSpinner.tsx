import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className} font-nunito`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full`}></div>
        <div 
          className={`absolute top-0 left-0 ${sizeClasses[size]} border-t-2 border-gray-500 animate-spin rounded-full`}
        ></div>
      </div>
      <p className="mt-3 text-gray-600 text-sm font-medium font-nunito">Loading...</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-nunito">
      <div className="relative">
        <div className="h-24 w-24 border-t-4 border-b-4 border-gray-200 animate-spin rounded-full"></div>
        <div className="absolute top-0 left-0 h-24 w-24 border-t-4 border-gray-500 animate-spin rounded-full" style={{ animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
}

export function ContentLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] font-nunito">
      <div className="relative">
        <div className="h-16 w-16 border-t-3 border-b-3 border-gray-200 animate-spin rounded-full"></div>
        <div className="absolute top-0 left-0 h-16 w-16 border-t-3 border-gray-500 animate-spin rounded-full" style={{ animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
}

export function SmallLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-t-white border-r-white border-b-white border-l-transparent animate-spin rounded-full"></div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-t-white border-r-white border-b-white border-l-transparent animate-spin rounded-full"></div>
    </div>
  );
} 