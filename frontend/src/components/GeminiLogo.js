import React from 'react';

const GeminiLogo = ({ width = 24, height = 24, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22Z" 
      fill="url(#gemini-gradient)" 
    />
    <defs>
      <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4eabfa" />
        <stop offset="40%" stopColor="#9b72cb" />
        <stop offset="75%" stopColor="#d96570" />
        <stop offset="100%" stopColor="#e8ac69" />
      </linearGradient>
    </defs>
  </svg>
);

export default GeminiLogo;
