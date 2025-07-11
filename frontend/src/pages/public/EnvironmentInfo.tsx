// Environment Information Page

import React from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { 
  Server, 
  Database, 
  Settings, 
  Globe, 
  Code, 
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { getIsDevelopmentMode, getIsBackendAvailable, developmentUtils } from '@/services/api/developmentMode';

const EnvironmentInfo: React.FC = () => {
  const isDevelopmentMode = getIsDevelopmentMode();
  const isBackendAvailable = getIsBackendAvailable();
  const mockUsers = isDevelopmentMode ? developmentUtils.getAllUsers() : [];

  const environmentData = {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    apiUrl: import.meta.env.VITE_API_GATEWAY_URL,
    baseUrl: import.meta.env.BASE_URL,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Environment Information
            </h1>
            <p className="text-gray-600">
              Current application configuration and development status
            </p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  isBackendAvailable ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Server className={`w-6 h-6 ${
                    isBackendAvailable ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Backend Status</h3>
                  <Badge variant={isBackendAvailable ? 'success' : 'destructive'}>
                    {isBackendAvailable ? 'Connected' : 'Offline'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {isBackendAvailable 
                  ? 'Connected to live backend API'
                  : 'Backend server not available'
                }
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  isDevelopmentMode ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <Database className={`w-6 h-6 ${
                    isDevelopmentMode ? 'text-blue-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Data Source</h3>
                  <Badge variant={isDevelopmentMode ? 'info' : 'success'}>
                    {isDevelopmentMode ? 'Mock Data' : 'Live API'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {isDevelopmentMode 
                  ? 'Using mock data for development'
                  : 'Connected to production database'
                }
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  import.meta.env.DEV ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Settings className={`w-6 h-6 ${
                    import.meta.env.DEV ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Environment</h3>
                  <Badge variant={import.meta.env.DEV ? 'warning' : 'success'}>
                    {import.meta.env.MODE}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {import.meta.env.DEV 
                  ? 'Development environment with debug features'
                  : 'Production environment'
                }
              </p>
            </Card>
          </div>

          {/* Environment Variables */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Environment Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(environmentData).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Mock Data Information */}
          {isDevelopmentMode && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Mock Data Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Mock Users:</span>
                  <Badge variant="info">{mockUsers.length}</Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Available Test Accounts:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{user.email}</span>
                        <Badge variant="outline" size="sm">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => developmentUtils.showStatus()}
                  >
                    Show Console Status
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => developmentUtils.resetToDefaults()}
                  >
                    Reset Mock Data
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Development Features */}
          {import.meta.env.DEV && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Development Features</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Available Features:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Mock API Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Development Status Panel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Error Handling Demo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Console Debug Utilities</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Quick Links:</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.location.href = '/error-demo'}
                      className="w-full justify-start"
                    >
                      Error Handling Demo
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.location.href = '/jobs'}
                      className="w-full justify-start"
                    >
                      Public Job Listings
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.location.href = '/auth/signup'}
                      className="w-full justify-start"
                    >
                      Registration Form
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Status Messages */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
            </div>
            
            <div className="space-y-3">
              {!isBackendAvailable && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Backend Server Offline</p>
                    <p className="text-sm text-yellow-700">
                      The application is running in frontend-only mode with mock data. 
                      This is normal for development when no backend server is running.
                    </p>
                  </div>
                </div>
              )}
              
              {isDevelopmentMode && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Development Mode Active</p>
                    <p className="text-sm text-blue-700">
                      Using mock data and development utilities. All features are available for testing.
                    </p>
                  </div>
                </div>
              )}
              
              {isBackendAvailable && !isDevelopmentMode && (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Production Mode</p>
                    <p className="text-sm text-green-700">
                      Connected to live backend API. All systems operational.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentInfo;
