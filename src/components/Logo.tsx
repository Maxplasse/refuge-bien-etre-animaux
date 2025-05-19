import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "h-16 w-auto" }: LogoProps) => {
  return (
    <img 
      src="/images/logo.png" 
      alt="L'Arche de Ringo"
      className={className}
    />
  );
};

export default Logo; 