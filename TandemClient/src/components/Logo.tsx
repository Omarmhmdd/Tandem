import React, { useMemo } from 'react';
import type { LogoProps } from '../types/component.types';

/**
 * Logo component displaying the TANDEM brand logo
 * 
 * Features:
 * - Responsive sizing with proper aspect ratio preservation
 * - Light/dark variant support for different backgrounds
 * - Accessible with proper ARIA labels
 * - Production-ready SVG optimization
 * 
 * @param size - Logo size: 'sm' (32px), 'md' (40px), or 'lg' (48px) height
 * @param showText - DEPRECATED: Text is now part of SVG. Kept for backward compatibility.
 * @param className - Additional CSS classes
 * @param variant - 'light' for dark backgrounds (inverts colors), 'dark' for light backgrounds
 */
export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText: _showText = true, // Deprecated but kept for backward compatibility - text is now part of SVG
  className = '', 
  variant = 'dark'
}) => {
  // Size mapping: height in pixels (width scales automatically maintaining ~3:1 aspect ratio)
  const sizeConfig = useMemo(() => {
    const configs = {
      sm: { height: 'h-8' },      // 32px height, auto width (~96px)
      md: { height: 'h-10' },     // 40px height, auto width (~120px)
      lg: { height: 'h-12' },     // 48px height, auto width (~144px)
    };
    return configs[size];
  }, [size]);

  // Generate unique IDs for SVG elements to avoid conflicts when multiple logos are rendered
  const svgId = useMemo(() => `tandem-logo-${size}-${variant}`, [size, variant]);

  // CSS classes for variant (light = invert for white logo on dark bg)
  const variantClasses = variant === 'light' 
    ? 'brightness-0 invert' 
    : '';

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label="TANDEM Logo"
    >
      <svg 
        id={svgId}
        data-name="TANDEM Logo"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 514.17 170.47"
        className={`${sizeConfig.height} w-auto ${variantClasses} flex-shrink-0 transition-opacity duration-200`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="false"
        focusable="false"
      >
        <defs>
          <style>
            {`
              #${svgId} .cls-1 { fill: #9d75ed; }
              #${svgId} .cls-2 { fill: #52379e; }
              #${svgId} .cls-3 { fill: #d7bafb; }
            `}
          </style>
        </defs>
        <g>
          {/* TANDEM Text */}
          <path className="cls-2" d="M213.95,88.26h-20.87v48.93h-11.16v-48.93h-20.96v-9.8h52.98v9.8Z"/>
          <path className="cls-2" d="M260.68,89.44v47.74h-9.46l-.42-6.17c-3.38,4.31-9.63,7.52-16.73,7.52-12.59,0-23.41-9.72-23.41-25.1s10.56-25.27,23.66-25.27c7.1,0,13.18,3.04,16.48,7.52l.42-6.25h9.46ZM249.95,113.35c0-9.13-5.58-15.38-14.03-15.38s-14.03,6.34-14.03,15.46,5.41,15.38,14.03,15.38,14.03-6.42,14.03-15.46Z"/>
          <path className="cls-2" d="M316.53,104.73v32.45h-10.73v-28.22c0-7.18-3.63-10.48-9.97-10.48-5.32,0-11.07,2.7-14.62,9.21v29.49h-10.73v-47.74h10.73v7.86c4.23-5.41,10.23-8.87,17.66-8.87,10.9,0,17.66,6.84,17.66,16.31Z"/>
          <path className="cls-2" d="M372.98,70.42v66.76h-9.04l-.68-6.34c-3.3,4.39-9.63,7.69-16.9,7.69-12.59,0-23.41-9.72-23.41-25.1s10.56-25.27,23.66-25.27c6.68,0,12.25,2.7,15.63,6.59v-24.34h10.73ZM362.24,113.35c0-9.13-5.58-15.38-14.03-15.38s-14.03,6.34-14.03,15.46,5.41,15.38,14.03,15.38,14.03-6.42,14.03-15.46Z"/>
          <path className="cls-2" d="M427.14,115.55h-36.51c.42,8.28,6,13.69,15.04,13.69,5.07,0,9.89-1.77,13.69-6.42l6.51,7.27c-6,6.17-12.68,8.37-21.04,8.37-15.21,0-24.93-10.06-24.93-25.18,0-13.86,9.38-25.01,24.08-25.01s23.75,10.48,23.15,27.29ZM390.97,107.69h25.01c-1.18-7.27-6.08-10.14-12-10.14-6.68,0-11.66,3.72-13.01,10.14Z"/>
          <path className="cls-2" d="M514.17,106.17v31.01h-10.73v-27.97c0-7.27-3.04-10.56-9.63-10.56-5.83,0-10.48,2.54-14.2,8.54v30h-10.73v-27.97c0-7.27-3.04-10.56-9.72-10.56-5.83,0-10.48,2.54-14.2,8.7v29.83h-10.73v-47.74h10.73v8.28c3.89-6.59,10.65-9.38,17.24-9.38,8.62,0,14.2,4.14,16.31,10.73,4.06-7.69,11.24-10.73,18.25-10.73,11.32,0,17.41,7.35,17.41,17.83Z"/>
        </g>
        <g>
          {/* Icon - Two connected profile figures */}
          <g>
            {/* Right figure (light purple) */}
            <path className="cls-3" d="M132.98,77.92c0-16.61-14.76-25.16-29.78-25-15.02-.16-29.78,8.39-29.78,25,.06,18.19-.05,34.1.02,72.91.04,18.6,15.27,19.63,15.27,19.63h28.97s15.23-1.03,15.27-19.63c.07-38.81-.04-54.73.02-72.91Z"/>
            <path className="cls-3" d="M104.34,0c-13.68,0-24.77,11.76-24.77,26.27s11.09,26.27,24.77,26.27,24.77-11.76,24.77-26.27S118.02,0,104.34,0Z"/>
            <path className="cls-3" d="M123.4,120.91c6.23,4.68,20.68,2.81,21.48-9.21.79-11.93-12.4-39.6-12.4-39.6,0,0-15.44,44.04-9.08,48.82Z"/>
          </g>
          {/* Left figure (purple) */}
          <path className="cls-1" d="M41.35,0c-13.68,0-24.77,11.76-24.77,26.27s11.09,26.27,24.77,26.27,24.77-11.76,24.77-26.27S55.03,0,41.35,0Z"/>
          <path className="cls-1" d="M73.41,77.92c0-16.61-14.76-25.16-29.78-25-15.02-.16-29.78,8.39-29.78,25,.06,18.19-.05,34.1.02,72.91.04,18.6,15.27,19.63,15.27,19.63h28.97s15.23-1.03,15.27-19.63c.08-38.81-.04-54.73.02-72.91Z"/>
          <path className="cls-1" d="M.03,111.69c.8,11.93,17.62,14.03,23.98,9.26,6.36-4.77-7.43-54.31-7.43-54.31C16.58,66.64-.77,99.76.03,111.69Z"/>
          {/* Connection elements */}
          <path className="cls-3" d="M50.73,84.01c-6.2,3.1-34.15-17.36-34.15-17.36-2.11-1.49-6.11,1.97-7.13,4-1.02,2.03-1.55,6.56,1.12,8.32,0,0,32.53,25.33,40.16,22.23,7.64-3.1,39.89-26.29,39.89-26.29,1.31-6.78-3.9-18.3-3.9-18.3,0,0-29.79,24.3-35.99,27.4Z"/>
          <path className="cls-1" d="M125.41,60.86s-22.79,18.01-26.26,18.18c-2.75.13-35.92-20.57-35.92-20.57-2.64,6.38-5.58,14.21-5.58,14.21,0,0,39.23,22.31,42.57,22.31,7.16,0,30.38-20.79,32.18-22.54.31-.3,3.4-4.18.58-8.6-1.75-3.12-5.78-4.29-7.57-2.98Z"/>
        </g>
      </svg>
    </div>
  );
};
