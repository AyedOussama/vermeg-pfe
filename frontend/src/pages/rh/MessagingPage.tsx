import React from 'react';
import MessagingCenter from '@/components/rh/MessagingCenter';

const MessagingPage: React.FC = () => {
  // In a real app, these would come from auth context
  const currentUser = {
    id: 'rh_user_1',
    name: 'HR Team',
    role: 'RH' as const
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with candidates about their applications</p>
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
