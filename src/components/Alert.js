import React from 'react';
import './Alert.css'

const Alert = ({ type, message, additionalClasses = '' }) => {
  const getAlertClasses = (type) => {
    switch (type) {
      case 'info':
        return 'border-blue-300 bg-blue-50 text-blue-800 dark:text-blue-400 dark:bg-gray-800 dark:border-blue-800';
      case 'danger':
        return 'border-red-300 bg-red-50 text-red-800 dark:text-red-400 dark:bg-gray-800 dark:border-red-800';
      case 'success':
        return 'border-green-300 bg-green-50 text-green-800 dark:text-green-400 dark:bg-gray-800 dark:border-green-800';
      case 'warning':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800';
      case 'dark':
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 mb-4 text-sm rounded-lg border-t-4 ${getAlertClasses(type)} ${additionalClasses}`} role="alert">
      <svg className="flex-shrink-0 w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span className="sr-only">{type}</span>
      <div>
        <span className="font-medium"></span> {message}
      </div>
    </div>
  );
};

export default Alert;
