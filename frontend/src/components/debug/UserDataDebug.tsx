import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';

const UserDataDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  // Token storage removed - using mock data

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Data Debug</h1>
      
      {/* Auth State */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Authentication State</h2>
        <div className="space-y-2">
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Has User:</strong> {user ? 'Yes' : 'No'}</p>
        </div>
      </Card>

      {/* User from Auth Hook */}
      {user && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">User from Auth Hook</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>
      )}

      {/* Stored Token Data */}
      {storedTokenData && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Stored Token Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(storedTokenData, null, 2)}
          </pre>
        </Card>
      )}

      {/* Profile Data */}
      {user?.profile && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user.profile, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default UserDataDebug;
