import React from 'react';
import { Crown, Star } from 'lucide-react';

const PremiumBadge = ({ 
  isPremium = false, 
  size = 'sm', 
  variant = 'default',
  showIcon = true,
  className = '' 
}) => {
  if (!isPremium) return null;

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
    gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`inline-flex items-center space-x-1 rounded-full font-semibold shadow-sm ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {showIcon && (
        <Crown className={iconSizes[size]} />
      )}
      <span>Premium</span>
    </div>
  );
};

export default PremiumBadge;
