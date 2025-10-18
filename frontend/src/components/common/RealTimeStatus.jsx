import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Circle } from 'lucide-react';
import { useMessage } from '../../context/MessageContext';

const RealTimeStatus = () => {
  const { isConnected } = useMessage();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Show status indicator briefly when connection changes
    if (isConnected !== null) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!showStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Real-time Connected</span>
            <Circle className="w-2 h-2 fill-green-500 animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Connecting...</span>
            <Circle className="w-2 h-2 fill-red-500 animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
};

export default RealTimeStatus;
