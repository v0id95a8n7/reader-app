import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function LoadingSpinner({
  size = "medium",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-5 w-5",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${className} font-nunito`}
    >
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-gray-200`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} animate-spin rounded-full border-t-2 border-gray-500`}
        ></div>
      </div>
      <p className="font-nunito mt-3 text-sm font-medium text-gray-600">
        Loading...
      </p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="font-nunito flex min-h-screen items-center justify-center bg-gray-50">
      <div className="relative">
        <div className="h-24 w-24 animate-spin rounded-full border-t-4 border-b-4 border-gray-200"></div>
        <div
          className="absolute top-0 left-0 h-24 w-24 animate-spin rounded-full border-t-4 border-gray-500"
          style={{ animationDuration: "1.5s" }}
        ></div>
      </div>
    </div>
  );
}

export function ContentLoader() {
  return (
    <div className="font-nunito flex min-h-[60vh] items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-t-3 border-b-3 border-gray-200"></div>
        <div
          className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-t-3 border-gray-500"
          style={{ animationDuration: "1.5s" }}
        ></div>
      </div>
    </div>
  );
}

export function SmallLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-white border-r-white border-b-white border-l-transparent"></div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-white border-r-white border-b-white border-l-transparent"></div>
    </div>
  );
}
