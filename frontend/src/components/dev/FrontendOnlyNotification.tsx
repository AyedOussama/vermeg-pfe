// Frontend-Only Mode Notification

import React, { useState, useEffect } from 'react';
import { X, Wifi, WifiOff, Settings } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { getIsDevelopmentMode } from '@/services/api/developmentMode';

const FrontendOnlyNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (!import.meta.env.DEV) return;

    // Check if user has already dismissed this notification
    const dismissed = localStorage.getItem('frontend_only_notification_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Show notification if in development mode
    if (getIsDevelopmentMode()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('frontend_only_notification_dismissed', 'true');
  };

  const handleDontShowAgain = () => {
    handleDismiss();
    localStorage.setItem('frontend_only_notification_permanent', 'true');
  };

  // Don't render if dismissed or not in dev mode
  if (!import.meta.env.DEV || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">   
            <WifiOff className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Frontend-Only Mode
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Backend connection checks are disabled to prevent network errors. 
              The app works fully with mock data.
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="small"
                onClick={handleDismiss}
                className="text-xs"
              >
                Got it
              </Button>
              
              <button
                onClick={handleDontShowAgain}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Don't show again
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Settings className="w-3 h-3" />
            <span>Use the Dev Status panel (bottom-right) to enable backend checking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontendOnlyNotification;
