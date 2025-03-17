import React from 'react';

/**
 * SkeletonLoader Component
 * 
 * A simple component that displays skeleton loading placeholders
 * for various UI elements while data is being fetched.
 */
const SkeletonLoader = ({ type, count = 1, className = '' }) => {
  const getSkeletonByType = () => {
    switch (type) {
      case 'row':
        return (
          <div className={`w-full h-12 bg-gray-100 animate-pulse rounded my-1 ${className}`} />
        );
      
      case 'cell':
        return (
          <div className={`w-full h-8 bg-gray-100 animate-pulse rounded ${className}`} />
        );
        
      case 'text':
        return (
          <div className={`w-3/4 h-4 bg-gray-100 animate-pulse rounded ${className}`} />
        );
        
      case 'button':
        return (
          <div className={`w-20 h-8 bg-gray-100 animate-pulse rounded ${className}`} />
        );
        
      case 'table':
        // Header + rows
        return (
          <div className="w-full">
            <div className="w-full h-12 bg-gray-200 animate-pulse rounded mb-2" />
            {Array(count).fill().map((_, i) => (
              <div key={i} className="w-full h-12 bg-gray-100 animate-pulse rounded my-1" />
            ))}
          </div>
        );
        
      default:
        return (
          <div className={`w-full h-8 bg-gray-100 animate-pulse rounded ${className}`} />
        );
    }
  };
  
  // If multiple items are requested, return an array of skeletons
  if (count > 1 && type !== 'table') {
    return (
      <>
        {Array(count).fill().map((_, i) => (
          <React.Fragment key={i}>
            {getSkeletonByType()}
          </React.Fragment>
        ))}
      </>
    );
  }
  
  // Otherwise return a single skeleton
  return getSkeletonByType();
};

export default SkeletonLoader;
