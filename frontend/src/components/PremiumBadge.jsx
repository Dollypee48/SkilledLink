import React from 'react';
import { Crown, Star, Shield } from 'lucide-react';

const PremiumBadge = ({ 
  size = 'sm', 
  variant = 'default', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-5 h-5 text-sm',
    md: 'w-6 h-6 text-base',
    lg: 'w-8 h-8 text-lg',
    xl: 'w-10 h-10 text-xl'
  };

  const variants = {
    default: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white',
    gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-700 text-white',
    green: 'bg-gradient-to-r from-green-500 to-green-700 text-white'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className={`inline-flex items-center justify-center rounded-full ${sizeClasses[size]} ${variants[variant]}`}>
        <Crown className="w-3/4 h-3/4" />
      </div>
      {showText && (
        <span className={`font-semibold ${textSizes[size]} ${variants[variant].includes('text-white') ? 'text-[#F59E0B]' : 'text-gray-700'}`}>
          Premium
        </span>
      )}
    </div>
  );
};

export default PremiumBadge;
