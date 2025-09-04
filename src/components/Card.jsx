import React from 'react';

const Card = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClasses = 'bg-white rounded-lg shadow-card p-6';
  
  const variants = {
    default: '',
    stats: 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;