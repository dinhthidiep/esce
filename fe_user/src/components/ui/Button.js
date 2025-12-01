import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  onClick,
  asChild,
  ...props 
}) => {
  const buttonClasses = `btn btn-${variant} btn-${size} ${className}`.trim();
  
  if (asChild && props.to) {
    return (
      <Link to={props.to} className={buttonClasses} onClick={onClick}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={buttonClasses} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;

