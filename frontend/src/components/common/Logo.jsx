import React from 'react';

const Logo = ({ 
  variant = 'full', // 'full', 'icon', 'text'
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  className = '',
  showText = true,
  textColor = 'white' // 'white', 'dark', or custom color class
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  // Determine text color class
  const getTextColorClass = () => {
    if (textColor === 'white') return 'text-white';
    if (textColor === 'dark') return 'text-[#151E3D]';
    return textColor; // Custom color class
  };

  const LogoIcon = () => (
    <svg 
      className={`${iconSize} ${className}`}
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background with rounded square */}
      <rect 
        x="4" 
        y="4" 
        width="40" 
        height="40" 
        rx="12" 
        fill="url(#gradient1)" 
        stroke="url(#gradient2)" 
        strokeWidth="1.5"
      />
      
      {/* Main geometric shape - Abstract link/connection symbol */}
      <path 
        d="M16 16C16 14.8954 16.8954 14 18 14H30C31.1046 14 32 14.8954 32 16V20C32 21.1046 31.1046 22 30 22H26V26C26 27.1046 26.8954 28 28 28H30C31.1046 28 32 28.8954 32 30V34C32 35.1046 31.1046 36 30 36H18C16.8954 36 16 35.1046 16 34V30C16 28.8954 16.8954 28 18 28H20V22H18C16.8954 22 16 21.1046 16 20V16Z" 
        fill="white" 
        fillOpacity="0.95"
      />
      
      {/* Connection lines extending outward */}
      <path 
        d="M8 20L14 20" 
        stroke="url(#gradient3)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M34 20L40 20" 
        stroke="url(#gradient3)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M8 28L14 28" 
        stroke="url(#gradient3)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M34 28L40 28" 
        stroke="url(#gradient3)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Corner accent elements */}
      <circle cx="6" cy="20" r="2" fill="url(#gradient2)" />
      <circle cx="42" cy="20" r="2" fill="url(#gradient2)" />
      <circle cx="6" cy="28" r="2" fill="url(#gradient2)" />
      <circle cx="42" cy="28" r="2" fill="url(#gradient2)" />
      
      {/* Center connection hub */}
      <circle cx="24" cy="24" r="3" fill="url(#gradient2)" />
      
      {/* Skill indicators - small geometric shapes */}
      <rect x="10" y="10" width="3" height="3" rx="1" fill="url(#gradient3)" />
      <rect x="35" y="10" width="3" height="3" rx="1" fill="url(#gradient3)" />
      <rect x="10" y="35" width="3" height="3" rx="1" fill="url(#gradient3)" />
      <rect x="35" y="35" width="3" height="3" rx="1" fill="url(#gradient3)" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#151E3D" />
          <stop offset="100%" stopColor="#1E2A4A" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'icon') {
    return null; // No icon for now
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`${textSize} font-bold ${getTextColorClass()}`}>
          Skilled<span className="text-[#F59E0B]">Link</span>
        </span>
      </div>
    );
  }

  // Full logo (text only for now)
  return (
    <div className={`flex items-center ${className}`}>
      {showText && (
        <div>
          <span className={`${textSize} font-bold ${getTextColorClass()}`}>
            Skilled<span className="text-[#F59E0B]">Link</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
