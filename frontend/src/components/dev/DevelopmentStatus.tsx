// Development Status Component

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Wifi, 
  WifiOff, 
  Settings, 
  Users, 
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { getIsDevelopmentMode, getIsBackendAvailable, developmentUtils } from '@/services/api/developmentMode';

interface DevelopmentStatusProps {
  className?: string;
}

const DevelopmentStatus: React.FC<DevelopmentStatusProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [mockUsers, setMockUsers] = useState<any[]>([]);
  const [backendCheckEnabled, setBackendCheckEnabled] = useState(false);
  const [forceDevMode, setForceDevMode] = useState(false);

  useEffect(() => {
    // Only show in development environment
    if (import.meta.env.DEV) {
      setIsDevelopmentMode(getIsDevelopmentMode());
      setIsBackendAvailable(getIsBackendAvailable());
      setBackendCheckEnabled(localStorage.getItem('CHECK_BACKEND') === 'true');
      setForceDevMode(localStorage.getItem('FORCE_DEV_MODE') === 'true');

      if (getIsDevelopmentMode()) {
        setMockUsers(developmentUtils.getAllUsers());
      }
    }
  }, []);

  // Don't render in production
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleClearData = () => {
    developmentUtils.clearAllData();
    setMockUsers([]);
  };

  const handleResetData = () => {
    developmentUtils.resetToDefaults();
    setMockUsers(developmentUtils.getAllUsers());
  };

  const handleShowStatus = () => {
    developmentUtils.showStatus();
  };

  const handleToggleBackendCheck = () => {
    if (backendCheckEnabled) {
      developmentUtils.disableBackendCheck();
      setBackendCheckEnabled(false);
      setForceDevMode(true);
    } else {
      developmentUtils.enableBackendCheck();
      setBackendCheckEnabled(true);
      setForceDevMode(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outlined"
          size="small"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white shadow-lg border-gray-300 hover:bg-gray-50"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="ml-1">Dev Status</span>
        </Button>
      </div>

      {/* Status Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-80">
          <Card className="p-4 shadow-xl border-2 border-gray-200 bg-white">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Development Status
                </h3>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setIsVisible(false)}
                  className="p-1"
                >
                  ×
                </Button>
              </div>

              {/* Connection Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Backend Connection</span>
                  <div className="flex items-center gap-2">
                    {isBackendAvailable ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <Badge variant="success" size="sm">Connected</Badge>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <Badge variant="destructive" size="sm">Offline</Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">API Mode</span>
                  <div className="flex items-center gap-2">
                    {isDevelopmentMode ? (
                      <>
                        <Database className="w-4 h-4 text-blue-500" />
                        <Badge variant="info" size="sm">Mock Data</Badge>
                      </>
                    ) : (
                      <>
                        <Server className="w-4 h-4 text-green-500" />
                        <Badge variant="success" size="sm">Live API</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mock Data Info */}
              {isDevelopmentMode && (
                <div className="space-y-3">
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Mock Users
                      </span>
                      <Badge variant="secondary" size="sm">{mockUsers.length}</Badge>
                    </div>
                    
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {mockUsers.map((user, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                          <span className="font-mono">{user.email}</span>
                          <span className="text-gray-500 capitalize">{user.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Backend Check Control */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Backend Checking</span>
                      <Badge variant={backendCheckEnabled ? 'success' : 'secondary'} size="sm">
                        {backendCheckEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleToggleBackendCheck}
                      className={`text-xs w-full ${
                        backendCheckEnabled
                          ? 'text-red-600 border-red-300 hover:bg-red-50'
                          : 'text-green-600 border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {backendCheckEnabled ? (
                        <>
                          <WifiOff className="w-3 h-3 mr-1" />
                          Disable Backend Check
                        </>
                      ) : (
                        <>
                          <Wifi className="w-3 h-3 mr-1" />
                          Enable Backend Check
                        </>
                      )}
                    </Button>
                    {forceDevMode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Network requests to backend are disabled
                      </p>
                    )}
                  </div>

                  {/* Development Actions */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleShowStatus}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Show Status
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleResetData}
                        className="text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset Data
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClearData}
                        className="text-xs text-red-600 border-red-300 hover:bg-red-50 col-span-2"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Environment Info */}
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>API URL: {import.meta.env.VITE_API_GATEWAY_URL}</div>
                  <div>Mode: {import.meta.env.MODE}</div>
                  <div>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Frontend-Only Mode:</strong> Backend checking is disabled to prevent network errors. The app uses mock data for all functionality.
                </p>
                {forceDevMode ? (
                  <p className="text-xs text-blue-700 mt-1">
                    Enable backend checking above if you have a server running on port 7000.
                  </p>
                ) : (
                  <p className="text-xs text-blue-700 mt-1">
                    Backend checking is enabled. Disable it to prevent connection attempts.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default DevelopmentStatus;
