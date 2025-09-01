import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Search,
  Calendar,
  User,
  Package,
  CreditCard,
  Download,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface PaymentRecord {
  _id: string;
  type: 'enrollment' | 'merchandise' | 'trial';
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'attempted' | 'failed' | 'completed';
  details: {
    orderId?: string;
    paymentId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    sport?: string;
    planId?: string;
    courtLocation?: string;
    merchandiseId?: string;
    quantity?: number;
    enrollmentId?: string;
  };
  createdAt: number;
  updatedAt: number;
  user?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
}

const SimplePaymentTracker: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'enrollment' | 'merchandise' | 'trial'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Fetch all payments
  const allPayments = useQuery(api.paymentTracking.getAllPaymentRecords, {
    status: statusFilter !== 'all' ? (statusFilter as 'completed' | 'pending' | 'failed') : undefined,
    type: typeFilter !== 'all' ? (typeFilter as 'enrollment' | 'merchandise' | 'trial') : undefined,
  }) || [];
  
  // Fetch enrollments for additional data
  const enrollments = useQuery(api.enrollments.getActiveEnrollments, {}) || [];
  
  // Fetch merchandise orders for additional data
  const merchandiseOrders = useQuery(api.merchandiseOrders.getAllOrders, {}) || [];

  // Filter payments
  const filteredPayments = allPayments.filter((payment: any) => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      payment.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.details?.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.details?.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = paymentDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Get enhanced payment data
  const enhancedPayments = filteredPayments.map((payment: any) => {
    let additionalInfo: any = {
      customerName: payment.userId,
      customerPhone: payment.userId,
      itemDescription: `${payment.type} payment`,
      orderNumber: ''
    };
    
    if (payment.type === 'enrollment' && payment.details?.enrollmentId) {
      const enrollment = enrollments.find((e: any) => e._id === payment.details.enrollmentId);
      if (enrollment) {
        additionalInfo = {
          customerName: enrollment.phoneNumber,
          customerPhone: enrollment.phoneNumber,
          itemDescription: `${enrollment.sport} - ${enrollment.planId}`,
          location: enrollment.courtLocation || 'TBD'
        };
      }
    } else if (payment.type === 'merchandise') {
      const order = merchandiseOrders.find((o: any) => o._id === payment.details?.orderId);
      if (order) {
        additionalInfo = {
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          itemDescription: order.items?.map((item: any) => `${item.merchandiseName} (${item.quantity})`).join(', ') || 'Merchandise Order',
          orderNumber: order.orderNumber
        };
      }
    }
    
    return {
      ...payment,
      ...additionalInfo
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'attempted':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'attempted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <User className="w-4 h-4" />;
      case 'merchandise':
        return <Package className="w-4 h-4" />;
      case 'trial':
        return <Calendar className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Customer',
      'Phone',
      'Type',
      'Description',
      'Amount',
      'Status',
      'Razorpay Payment ID',
      'Razorpay Order ID',
      'Order ID'
    ];
    
    const csvData = enhancedPayments.map(payment => [
      formatDate(payment.createdAt),
      payment.customerName || payment.userId,
      payment.customerPhone || payment.userId,
      payment.type,
      payment.itemDescription || `${payment.type} payment`,
      payment.amount,
      payment.status,
      payment.details?.razorpayPaymentId || '',
      payment.details?.razorpayOrderId || '',
      payment.details?.orderId || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Payment Tracker
            </h2>
            <p className="text-gray-600 mt-1">
              Complete payment history with customer details and transaction references
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Payments</p>
                <p className="text-2xl font-bold text-blue-900">{enhancedPayments.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {enhancedPayments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {enhancedPayments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatAmount(enhancedPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by phone, payment ID, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="enrollment">Enrollments</option>
            <option value="merchandise">Merchandise</option>
            <option value="trial">Trials</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment References
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enhancedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                enhancedPayments.map((payment: any) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(payment.createdAt)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.customerName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.customerPhone || payment.userId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type & Description */}
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        {getTypeIcon(payment.type)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {payment.type}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {payment.itemDescription || `${payment.type} payment`}
                          </div>
                          {payment.orderNumber && (
                            <div className="text-xs text-blue-600">
                              Order: {payment.orderNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>

                    {/* Payment References */}
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {payment.details?.razorpayPaymentId && (
                          <div>
                            <span className="font-medium text-gray-600">Payment ID:</span>
                            <div className="font-mono text-blue-600 break-all">
                              {payment.details.razorpayPaymentId}
                            </div>
                          </div>
                        )}
                        {payment.details?.razorpayOrderId && (
                          <div>
                            <span className="font-medium text-gray-600">Order ID:</span>
                            <div className="font-mono text-green-600 break-all">
                              {payment.details.razorpayOrderId}
                            </div>
                          </div>
                        )}
                        {payment.details?.orderId && (
                          <div>
                            <span className="font-medium text-gray-600">Internal ID:</span>
                            <div className="font-mono text-gray-600 break-all">
                              {payment.details.orderId}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {enhancedPayments.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {enhancedPayments.length} of {allPayments.length} payments
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplePaymentTracker;