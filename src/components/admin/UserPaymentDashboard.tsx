import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface PaymentSummary {
  phoneNumber: string;
  sport: string;
  planId: string;
  planDuration?: string;
  courtLocation: string;
  paymentAmount: number | string;
  paymentStatus: string;
  enrollmentDate: string;
  sessionStartDate: string;
  orderId?: string;
  paymentId?: string;
}

interface TrialBooking {
  phoneNumber: string;
  sport: string;
  selectedDate: number;
  userDetails: {
    name: string;
    age: number;
    email: string;
    phoneNumber: string;
  };
  status: string;
  courtLocation: string;
  bookingDate: number;
}

export const UserPaymentDashboard: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'enrollments' | 'trials' | 'merchandise' | 'payments'>('enrollments');

  // Get enrollment data
  const paymentSummaries = useQuery(api.enrollments.getUserPaymentSummary,
    searchPhone ? { phoneNumber: searchPhone } : {}
  );

  // Get trial bookings data
  const trialBookings = useQuery(api.trialBookings.getAllTrialBookings, {});

  // Get merchandise orders data
  const merchandiseOrders = useQuery(api.merchandiseOrders.getAllOrders, {});

  // Get unified payment records
  const allPayments = useQuery(api.paymentTracking.getAllPaymentRecords, {});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query automatically
  };

  const clearSearch = () => {
    setSearchPhone('');
  };

  // Filter trial bookings by search phone if provided
  const filteredTrialBookings = trialBookings?.filter((booking: any) =>
    !searchPhone || booking.phoneNumber.includes(searchPhone)
  ) || [];

  // Filter merchandise orders by search phone if provided
  const filteredMerchandiseOrders = merchandiseOrders?.filter((order: any) =>
    !searchPhone || order.customerPhone.includes(searchPhone)
  ) || [];

  // Filter all payments by search phone if provided
  const filteredAllPayments = allPayments?.filter((payment: any) =>
    !searchPhone || payment.userId.includes(searchPhone)
  ) || [];

  if (paymentSummaries === undefined || trialBookings === undefined || merchandiseOrders === undefined || allPayments === undefined) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          User Dashboard - All Bookings & Payments
        </h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${activeTab === 'enrollments'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Paid Enrollments ({paymentSummaries.length})
          </button>
          <button
            onClick={() => setActiveTab('trials')}
            className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${activeTab === 'trials'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Free Trials ({filteredTrialBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('merchandise')}
            className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${activeTab === 'merchandise'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Merchandise Orders ({filteredMerchandiseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${activeTab === 'payments'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            All Payments ({filteredAllPayments.length})
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          {searchPhone && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Court/Ground
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentSummaries.map((summary: PaymentSummary, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {summary.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="capitalize">{summary.sport}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof summary.paymentAmount === 'number'
                      ? `₹${summary.paymentAmount.toLocaleString()}`
                      : summary.paymentAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {summary.courtLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {summary.planDuration || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${summary.paymentStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : summary.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {summary.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {summary.enrollmentDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paymentSummaries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No paid enrollment records found.
            </div>
          )}
        </div>
      )}

      {/* Trial Bookings Tab */}
      {activeTab === 'trials' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Court/Ground
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trial Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrialBookings.map((booking: TrialBooking, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.userDetails.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="capitalize">{booking.sport}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.courtLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.selectedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTrialBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No trial booking records found.
            </div>
          )}
        </div>
      )}

      {/* Merchandise Orders Tab */}
      {activeTab === 'merchandise' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchandiseOrders.map((order: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerPhone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : order.paymentStatus === 'refunded'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'collected'
                      ? 'bg-gray-100 text-gray-800'
                      : order.status === 'ready_for_collection'
                        ? 'bg-purple-100 text-purple-800'
                        : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMerchandiseOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No merchandise order records found.
            </div>
          )}
        </div>
      )}

      {/* All Payments Tab */}
      {activeTab === 'payments' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllPayments.map((payment: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.type === 'enrollment'
                      ? 'bg-blue-100 text-blue-800'
                      : payment.type === 'merchandise'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : payment.status === 'attempted'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.details?.sport && (
                      <span className="capitalize">{payment.details.sport}</span>
                    )}
                    {payment.details?.planId && (
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.details.planId}
                      </span>
                    )}
                    {payment.details?.orderNumber && (
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.details.orderNumber}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAllPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payment records found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPaymentDashboard;