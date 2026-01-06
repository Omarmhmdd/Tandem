import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark';  // Add this line
}
export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' ,
  variant = 'dark'

}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Heart with glow rays */}
          <defs>
            <radialGradient id="heartGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#9E77ED" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9E77ED" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Glow rays */}
          <g opacity="0.4">
            <line x1="50" y1="25" x2="50" y2="15" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="50" y1="75" x2="50" y2="85" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="25" y1="50" x2="15" y2="50" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="75" y1="50" x2="85" y2="50" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="36" y1="36" x2="29" y2="29" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="64" y1="64" x2="71" y2="71" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="64" y1="36" x2="71" y2="29" stroke="#9E77ED" strokeWidth="1.5" />
            <line x1="36" y1="64" x2="29" y2="71" stroke="#9E77ED" strokeWidth="1.5" />
          </g>
          
          {/* Heart */}
          <path
            d="M50 35 C50 30, 45 25, 40 25 C35 25, 30 30, 30 35 C30 40, 50 55, 50 55 C50 55, 70 40, 70 35 C70 30, 65 25, 60 25 C55 25, 50 30, 50 35 Z"
            fill="#9E77ED"
            opacity="0.9"
          />
          
          {/* Left hand */}
          <path
            d="M30 65 L25 70 L22 68 L20 72 L25 75 L30 72 L32 70 L30 65 Z"
            stroke="#53389E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 65 L28 60 L26 62 L24 58 L28 56 L30 60 L32 62 L30 65 Z"
            stroke="#53389E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Right hand */}
          <path
            d="M70 65 L75 70 L78 68 L80 72 L75 75 L70 72 L68 70 L70 65 Z"
            stroke="#53389E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 65 L72 60 L74 62 L76 58 L72 56 L70 60 L68 62 L70 65 Z"
            stroke="#53389E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Clasped connection */}
          <ellipse
            cx="50"
            cy="70"
            rx="8"
            ry="5"
            fill="#53389E"
            opacity="0.3"
          />
        </svg>
      </div>
      {showText && (
       <span className={`font-bold ${variant=== 'light' ? 'text-white' : 'text-brand-primary'} ${textSizes[size]}`}>
          Tandem
        </span>
      )}
    </div>
  );
};

