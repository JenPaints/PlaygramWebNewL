import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit3,
  Truck,
  User,
  Phone,
  Calendar,
  DollarSign,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';

interface OrderItem {
  merchandiseId: Id<"merchandise">;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  merchandiseName: string;
  merchandiseImage: string;
}

interface Order {
  _id: Id<"merchandiseOrders">;
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'ready_for_collection' | 'collected' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  collectionDate?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

const OrderManagement: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');
  const [statusNotes, setStatusNotes] = useState('');

  // Queries
  const allOrders = useQuery(api.merchandiseOrders.getAllOrders) || [];
  const orderStats = useQuery(api.merchandiseOrders.getOrderStats);

  // Mutations
  const updateOrderStatus = useMutation(api.merchandiseOrders.updateOrderStatus);
  const cancelOrder = useMutation(api.merchandiseOrders.cancelOrder);

  // Filter orders based on status and search term
  const filteredOrders = allOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus({
        orderId: selectedOrder._id,
        status: newStatus,
        notes: statusNotes || undefined,
      });
      toast.success('Order status updated successfully!');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setStatusNotes('');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  const handleCancelOrder = async (orderId: Id<"merchandiseOrders">) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder({ orderId, reason: 'Cancelled by admin' });
        toast.success('Order cancelled successfully!');
      } catch (error) {
        toast.error('Failed to cancel order');
        console.error(error);
      }
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'paid': return 'text-green-400 bg-green-900/20';
      case 'processing': return 'text-blue-400 bg-blue-900/20';
      case 'ready_for_collection': return 'text-purple-400 bg-purple-900/20';
      case 'collected': return 'text-green-400 bg-green-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'ready_for_collection': return <Truck className="w-4 h-4" />;
      case 'collected': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Management</h2>
          {orderStats && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {orderStats.totalOrders} Total Orders
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {orderStats.pendingOrders} Pending
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                {orderStats.readyForCollection} Ready for Collection
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                ₹{orderStats.totalRevenue.toLocaleString()} Revenue
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="ready_for_collection">Ready for Collection</option>
            <option value="collected">Collected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                      <div className="text-sm text-gray-400">
                        Payment: {order.paymentStatus}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{order.customerName}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx}>{item.merchandiseName} x{item.quantity}</div>
                      ))}
                      {order.items.length > 2 && (
                        <div>+{order.items.length - 2} more...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">₹{order.totalAmount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{formatDate(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#89D3EC] hover:text-white"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status !== 'collected' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setShowStatusModal(true);
                          }}
                          className="text-yellow-400 hover:text-white"
                          title="Update Status"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {order.status !== 'collected' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-400 hover:text-white"
                          title="Cancel Order"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Orders Found</h3>
          <p className="text-gray-500">No orders match your current filters</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && !showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Info */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Number:</span>
                      <span className="text-white font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className={`font-medium ${
                        selectedOrder.paymentStatus === 'paid' ? 'text-green-400' :
                        selectedOrder.paymentStatus === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Amount:</span>
                      <span className="text-white font-medium">₹{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Date:</span>
                      <span className="text-white">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.collectionDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Collection Date:</span>
                        <span className="text-white">{formatDate(selectedOrder.collectionDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedOrder.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Notes</h4>
                    <p className="text-gray-300 text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-700/50 rounded-lg">
                        {item.merchandiseImage && (
                          <img
                            src={item.merchandiseImage}
                            alt={item.merchandiseName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-white">{item.merchandiseName}</h5>
                          <div className="text-sm text-gray-400">
                            Quantity: {item.quantity}
                            {item.size && ` • Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                          </div>
                          <div className="text-sm font-medium text-[#89D3EC]">
                            ₹{item.price} each
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-white">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Update Order Status</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setStatusNotes('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order: {selectedOrder.orderNumber}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_collection">Ready for Collection</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setStatusNotes('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;