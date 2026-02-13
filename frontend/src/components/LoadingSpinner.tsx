// LoadingSpinner.tsx
// UI loading spinner for cart page
// E-Commerce Microservices Frontend

import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-4 border-indigo-500 border-solid`}></div>
    </div>
  );
};

export default LoadingSpinner;
