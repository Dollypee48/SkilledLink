import React from 'react';
import { Lock, Crown, CheckCircle } from 'lucide-react';

const PremiumFeatureIndicator = ({ 
  isPremium = false, 
  feature = 'premium feature',
  children,
  className = '',
  showLock = true,
  showCheckmark = false
}) => {
  if (isPremium) {
    return (
      <div className={`relative ${className}`}>
        {children}
        {showCheckmark && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      {showLock && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">Premium Feature</p>
            <p className="text-xs text-gray-500">{feature}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumFeatureIndicator;
