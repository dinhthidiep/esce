import React from 'react';
import './Badge.css';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
};

export default Badge;










