import React from 'react';
import UserPaymentDashboard from './UserPaymentDashboard';

export const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Sports Academy Admin Dashboard
            </h1>
            <div className="text-sm text-gray-500">
              Manage enrollments and payments
            </div>
          </div>
        </div>
      </div>
      
      <UserPaymentDashboard />
    </div>
  );
};

export default AdminPage;