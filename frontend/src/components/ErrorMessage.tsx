// ErrorMessage.tsx
// UI error message for cart page
// E-Commerce Microservices Frontend

import React from "react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="bg-red-100 text-red-700 rounded-xl p-4 text-center mb-4">
    {message}
  </div>
);

export default ErrorMessage;
