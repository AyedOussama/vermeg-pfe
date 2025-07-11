import React from 'react';
import MessagingCenter from '@/components/rh/MessagingCenter';

const MessagingPage: React.FC = () => {
  // In a real app, these would come from auth context
  const currentUser = {
    id: 'candidate_1',
    name: 'John Doe',
    role: 'CANDIDATE' as const
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with HR about your applications</p>
      </div>
      
      <MessagingCenter
        userRole={currentUser.role}
        userId={currentUser.id}
        userName={currentUser.name}
        className="h-[700px]"
      />
    </div>
  );
};

export default MessagingPage;
