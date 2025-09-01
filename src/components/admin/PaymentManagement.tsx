import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

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
    sessionStartDate?: number;
    merchandiseId?: string;
    quantity?: number;
    trialDate?: number;
  };
  createdAt: number;
  updatedAt: number;
  paymentAmount?: number;
  paymentStatus?: string;
  razorpayPaymentId?: string;
  user?: {
    fullName?: string;
    phone?: string;
    studentId?: string;
  };
}

const PaymentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'attempted' | 'failed' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'enrollment' | 'merchandise' | 'trial'>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch all payments
  const payments = useQuery(api.paymentTracking.getAllPaymentRecords, { 
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  }) || [];

  // Sync missing payments mutation
  const syncMissingPayments = useMutation(api.paymentTracking.syncMissingPayments);
  
  // Debug payment mutation
  const debugUserPayment = useQuery(api.debugPayment.debugUserPayment, 
    searchTerm && searchTerm.includes('+91') ? { phoneNumber: searchTerm } : "skip"
  );
  const fixUserPaymentStatus = useMutation(api.debugPayment.fixUserPaymentStatus);
  const fixAllPendingPayments = useMutation(api.debugPayment.fixAllPendingPayments);

  // Filter payments based on search and filters
  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch = searchTerm === '' || 
      payment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.phone?.includes(searchTerm) ||
      payment.user?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPaymentStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    return matchesSearch && matchesPaymentStatus && matchesType;
  });

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 PaymentManagement Debug:');
    console.log('- Status Filter:', statusFilter);
    console.log('- Type Filter:', typeFilter);
    console.log('- Search Term:', searchTerm);
    console.log('- Raw Payments:', payments);
    console.log('- Payments Count:', payments.length);
    console.log('- Filtered Payments Count:', filteredPayments.length);
    
    // Payment type breakdown
    const enrollmentPayments = payments.filter(p => p.type === 'enrollment');
    const merchandisePayments = payments.filter(p => p.type === 'merchandise');
    const trialPayments = payments.filter(p => p.type === 'trial');
    
    console.log('📊 Payment Type Breakdown:');
    console.log('- Enrollment Payments:', enrollmentPayments.length);
    console.log('- Merchandise Payments:', merchandisePayments.length);
    console.log('- Trial Payments:', trialPayments.length);
    
    if (payments.length > 0) {
      console.log('- First Payment Sample:', payments[0]);
    }
    
    if (enrollmentPayments.length > 0) {
      console.log('- First Enrollment Payment:', enrollmentPayments[0]);
    }
    
    // Debug specific user if phone number is searched
    if (searchTerm && searchTerm.includes('+91') && debugUserPayment) {
      console.log('🔍 Debug User Payment Data:', debugUserPayment);
      
      // Check if user has paid enrollments but pending payments
      const hasPaidEnrollments = debugUserPayment.userEnrollments?.some(e => e.paymentStatus === 'paid');
      const hasPendingPayments = debugUserPayment.summary?.pendingPayments > 0;
      
      if (hasPaidEnrollments && hasPendingPayments) {
        console.log('⚠️ ISSUE DETECTED: User has paid enrollments but pending payment records!');
        console.log('- Paid Enrollments:', debugUserPayment.userEnrollments.filter(e => e.paymentStatus === 'paid'));
        console.log('- Pending Payments:', debugUserPayment.paymentRecords.filter(p => p.status === 'pending'));
      }
    }
  }, [payments, statusFilter, typeFilter, searchTerm, filteredPayments.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'attempted':
        return 'text-orange-600 bg-orange-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'attempted':
      return <RefreshCw className="w-4 h-4" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateStats = () => {
    const totalPayments = filteredPayments.length;
    const completedPayments = filteredPayments.filter((p: any) => p.status === 'completed').length;
    const pendingPayments = filteredPayments.filter((p: any) => p.status === 'pending').length;
    const attemptedPayments = filteredPayments.filter((p: any) => p.status === 'attempted').length;
    const totalRevenue = filteredPayments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    
    return { totalPayments, completedPayments, pendingPayments, attemptedPayments, totalRevenue };
  };

  const stats = calculateStats();

  const handleSyncPayments = async () => {
    setIsSyncing(true);
    try {
      const result = await syncMissingPayments({});
      console.log('🔄 Sync result:', result);
      toast.success(`Sync completed! Created ${result.missingPaymentsCreated || 0} missing payment records.`);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Sync failed: ' + (error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleFixPaymentStatus = async (phoneNumber: string) => {
    try {
      const result = await fixUserPaymentStatus({ phoneNumber });
      console.log('🔧 Fix result:', result);
      toast.success(result.message);
    } catch (error) {
      console.error('❌ Fix failed:', error);
      toast.error('Fix failed: ' + (error as Error).message);
    }
  };
  
  const handleBulkFixPayments = async () => {
    setIsSyncing(true);
    try {
      const result = await fixAllPendingPayments({});
      console.log('🔧 Bulk fix result:', result);
      toast.success(`${result.message} - Fixed ${result.totalUpdated} payments for ${result.usersFixed} users!`);
    } catch (error) {
      console.error('❌ Bulk fix failed:', error);
      toast.error('Bulk fix failed: ' + (error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Student ID', 'Name', 'Phone', 'Sport', 'Batch', 'Package', 'Amount', 'Payment Status', 'Enrollment Status', 'Razorpay Order ID'].join(','),
      ...filteredPayments.map((payment: any) => [
        formatDate(payment.createdAt),
        payment.user?.studentId || '',
        payment.user?.fullName || '',
        payment.user?.phone || '',
        payment.sport?.name || '',
        payment.batch?.name || '',
        payment.packageType,
        payment.paymentAmount,
        payment.paymentStatus,
        payment.enrollmentStatus,
        payment.razorpayOrderId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payment data exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Management</h2>
          <p className="text-gray-300">Track and manage enrollment payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSyncPayments}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Payments'}
          </button>
          <button
            onClick={handleBulkFixPayments}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Fixing...' : 'Fix All Pending'}
          </button>
          <button
            onClick={exportPayments}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-white">{stats.totalPayments}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-400">{stats.completedPayments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingPayments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Attempted</p>
              <p className="text-2xl font-bold text-orange-400">{stats.attemptedPayments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Existing search div */}
          {/* ... */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="enrollment">Enrollment</option>
              <option value="merchandise">Merchandise</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, student ID, or batch..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="attempted">Attempted</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          

        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.map((payment: any) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">
                        {payment.user?.fullName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {payment.user?.studentId} • {payment.user?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white capitalize">{payment.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {payment.type === 'enrollment' && payment.details?.sport && `Sport: ${payment.details.sport}`}
                      {payment.type === 'merchandise' && payment.details?.merchandiseId && `Item: ${payment.details.merchandiseId} (Qty: ${payment.details.quantity})`}
                      {payment.type === 'trial' && payment.details?.trialDate && `Date: ${new Date(payment.details.trialDate).toLocaleDateString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-green-400">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm">
                      {formatDate(payment.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && payment.type === 'enrollment' && (
                        <button
                          onClick={() => handleFixPaymentStatus(payment.userId)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Fix Payment Status"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Payments Found</h3>
            <p className="text-gray-500">No payments match your current filters.</p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{selectedPayment.user?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Student ID:</span>
                      <span className="text-white">{selectedPayment.user?.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white">{selectedPayment.user?.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-3">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{selectedPayment.type}</span>
                    </div>
                    {selectedPayment.type === 'enrollment' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sport:</span>
                          <span className="text-white">{selectedPayment.details?.sport}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plan:</span>
                          <span className="text-white">{selectedPayment.details?.planId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white">{selectedPayment.details?.courtLocation}</span>
                        </div>
                      </>
                    )}
                    {selectedPayment.type === 'merchandise' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Item ID:</span>
                          <span className="text-white">{selectedPayment.details?.merchandiseId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quantity:</span>
                          <span className="text-white">{selectedPayment.details?.quantity}</span>
                        </div>
                      </>
                    )}
                    {selectedPayment.type === 'trial' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trial Date:</span>
                        <span className="text-white">{selectedPayment.details?.trialDate ? new Date(selectedPayment.details.trialDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-green-400 font-medium">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {getStatusIcon(selectedPayment.status)}
                      {selectedPayment.status}
                    </span>
                  </div>
                  {selectedPayment.details?.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID:</span>
                      <span className="text-white font-mono text-xs">{selectedPayment.details.razorpayOrderId}</span>
                    </div>
                  )}
                  {selectedPayment.details?.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment ID:</span>
                      <span className="text-white font-mono text-xs">{selectedPayment.details.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">{formatDate(selectedPayment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated:</span>
                    <span className="text-white">{formatDate(selectedPayment.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;