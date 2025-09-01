import React, { useState } from 'react';
import { FileText, Download, CreditCard, Calendar, Package, Clock, Check, Truck, X, User, Phone, Receipt, TrendingUp } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const TransactionDetailsView: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch user's payment history from unified tracking system
  const allPayments = useQuery(
    api.paymentTracking.getAllPaymentRecords,
    {}
  ) || [];
  
  // Filter payments for current user
  const userPayments = allPayments.filter(payment => 
    payment.userId === user?.phoneNumber
  );
  
  // Fetch user enrollments
  const userEnrollments = useQuery(
    api.userEnrollments.getUserEnrollmentsByPhone,
    user?.phoneNumber ? { phoneNumber: user.phoneNumber } : "skip"
  ) || [];
  
  // Fetch user orders
  const userOrders = useQuery(api.merchandiseOrders.getOrdersByCustomer, {
    customerPhone: user?.phoneNumber || ''
  }) || [];

  // Helper functions
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'active':
        return <Check className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'failed':
      case 'cancelled':
        return <X className="w-3 h-3" />;
      case 'processing':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const activeEnrollments = userEnrollments.filter(e => e.enrollmentStatus === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">Transaction Details</h1>
        <p className="text-sm text-gray-600 mt-1">View transactions & receipts</p>
        
        {/* Stats Card */}
        <div className="mt-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Active Programs</span>
            </div>
            <p className="text-lg font-bold text-green-900 mt-1">{activeEnrollments.length}</p>
          </div>
        </div>
      </div>

      {/* Single Column Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          </div>
        </div>
      </div>

      {/* Unified Content */}
      <div className="p-4 space-y-6">
        {/* Enrollments Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-md font-semibold text-gray-900">Enrollments</h3>
          </div>
          <div className="space-y-3">
            {userEnrollments.length === 0 ? (
              <div className="text-center py-6">
                <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No enrollments found</p>
              </div>
            ) : (
              userEnrollments.map((enrollment) => (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {enrollment.sport?.name || 'Sport Program'}
                      </h3>
                      <p className="text-sm text-gray-600">{enrollment.packageType}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(enrollment.startDate)} - {formatDate(enrollment.endDate)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(enrollment.enrollmentStatus)
                    }`}>
                      {getStatusIcon(enrollment.enrollmentStatus)}
                      {enrollment.enrollmentStatus}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Sessions</p>
                      <p className="font-medium">{enrollment.sessionsAttended}/{enrollment.sessionsTotal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount Paid</p>
                      <p className="font-medium">₹{enrollment.paymentAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-green-600" />
            <h3 className="text-md font-semibold text-gray-900">Orders</h3>
          </div>
          <div className="space-y-3">
            {userOrders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No orders found</p>
              </div>
            ) : (
              userOrders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">Order #{order.orderNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(order.status)
                        }`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                      <div className="mt-2">
                        {order.items.slice(0, 2).map((item: any, index: number) => (
                          <p key={index} className="text-xs text-gray-600">
                            {item.name} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsView;