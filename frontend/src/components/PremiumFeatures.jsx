import React from 'react';
import { Crown, Star, TrendingUp, Shield, Zap, Headphones, BarChart3 } from 'lucide-react';

const PremiumFeatures = ({ isPremium, premiumFeatures }) => {
  const features = [
    {
      icon: Crown,
      title: 'Verified Badge',
      description: 'Get a verified badge on your profile to build trust with customers',
      active: premiumFeatures?.verifiedBadge || false
    },
    {
      icon: TrendingUp,
      title: 'Priority Search',
      description: 'Your profile appears first in search results',
      active: premiumFeatures?.prioritySearch || false
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights into your bookings and performance',
      active: premiumFeatures?.advancedAnalytics || false
    },
    {
      icon: Zap,
      title: 'Unlimited Bookings',
      description: 'No limits on the number of bookings you can accept',
      active: premiumFeatures?.unlimitedBookings || false
    },
    {
      icon: Headphones,
      title: 'Premium Support',
      description: 'Priority customer support and faster response times',
      active: premiumFeatures?.premiumSupport || false
    },
    {
      icon: Star,
      title: 'Featured Listing',
      description: 'Your profile gets featured placement on the homepage',
      active: premiumFeatures?.featuredListing || false
    }
  ];

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Unlock Premium Features</h3>
        </div>
        <p className="text-lg mb-6">
          Upgrade to Premium to access exclusive features that will help you grow your business and attract more customers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
              <feature.icon className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg">{feature.title}</h4>
                <p className="text-sm text-gray-200">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-8 h-8 text-[#F59E0B]" />
        <h3 className="text-2xl font-bold text-gray-800">Your Premium Features</h3>
      </div>
      <p className="text-gray-600 mb-6">
        You have access to all premium features! Here's what you can enjoy:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
            feature.active 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <feature.icon className={`w-6 h-6 flex-shrink-0 mt-1 ${
              feature.active ? 'text-green-600' : 'text-gray-400'
            }`} />
            <div>
              <h4 className={`font-semibold text-lg ${
                feature.active ? 'text-green-800' : 'text-gray-500'
              }`}>
                {feature.title}
                {feature.active && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </h4>
              <p className={`text-sm ${
                feature.active ? 'text-green-700' : 'text-gray-500'
              }`}>
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumFeatures;
