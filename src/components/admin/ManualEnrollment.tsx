import React, { useState } from 'react';
import { UserPlus, Search, Calendar, CreditCard, Users, BookOpen, MapPin, Phone, Mail } from 'lucide-react';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface EnrollmentFormData {
  studentPhone: string;
  studentName: string;
  studentEmail: string;
  batchId: string;
  packageType: string;
  packageDuration: string;
  sessionsTotal: number;
  paymentAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  notes: string;
}

const ManualEnrollment: React.FC = () => {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    studentPhone: '',
    studentName: '',
    studentEmail: '',
    batchId: '',
    packageType: '',
    packageDuration: '',
    sessionsTotal: 0,
    paymentAmount: 0,
    paymentMethod: 'cash',
    notes: '',
  });
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Queries
  const allBatches = useQuery(api.batches.getAllBatches);
  const searchedUser = useQuery(
    api.users.getUserByPhone,
    searchPhone ? { phone: searchPhone } : "skip"
  );

  // Mutations
  const createEnrollment = useMutation(api.userEnrollments.createUserEnrollment);
  const convex = useConvex();

  const packageOptions = [
    { id: '1-month', name: '1 Month Package', duration: '1 month', sessions: 8, price: 2000 },
    { id: '3-month', name: '3 Month Package', duration: '3 months', sessions: 24, price: 5500 },
    { id: '6-month', name: '6 Month Package', duration: '6 months', sessions: 48, price: 10000 },
    { id: '12-month', name: '12 Month Package', duration: '12 months', sessions: 96, price: 18000 },
  ];

  const handleSearchStudent = () => {
    if (!searchPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    setSearchPhone(searchPhone.trim());
  };

  const handleSelectExistingStudent = () => {
    if (searchedUser) {
      setSelectedStudent(searchedUser);
      setFormData(prev => ({
        ...prev,
        studentPhone: searchedUser.phone || '',
        studentName: searchedUser.name || '',
        studentEmail: searchedUser.email || '',
      }));
      toast.success('Student selected successfully');
    }
  };

  const handleCreateNewStudent = () => {
    if (!formData.studentPhone.trim() || !formData.studentName.trim()) {
      toast.error('Please fill in student phone and name');
      return;
    }
    
    setSelectedStudent({
      phone: formData.studentPhone,
      name: formData.studentName,
      email: formData.studentEmail,
      isNew: true,
    });
    toast.success('New student details added');
  };

  const handlePackageSelect = (packageId: string) => {
    const selectedPackage = packageOptions.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        packageType: selectedPackage.name,
        packageDuration: selectedPackage.duration,
        sessionsTotal: selectedPackage.sessions,
        paymentAmount: selectedPackage.price,
      }));
    }
  };

  const handleSubmitEnrollment = async () => {
    if (!selectedStudent || !formData.batchId || !formData.packageType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate dates
      const startDate = Date.now();
      const durationMonths = parseInt(formData.packageDuration.split(' ')[0]);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // Create enrollment (simplified for existing users)
      const enrollmentId = await createEnrollment({
        userId: selectedStudent._id as any,
        batchId: formData.batchId as any,
        packageType: formData.packageType,
        packageDuration: formData.packageDuration,
        sessionsTotal: formData.sessionsTotal,
        startDate,
        endDate: endDate.getTime(),
        paymentAmount: formData.paymentAmount,
        paymentStatus: 'paid', // Manual enrollments are considered paid
        enrollmentStatus: 'active',
        notes: formData.notes || undefined,
      });

      toast.success('Student enrolled successfully with automatic session schedules!');
      console.log('✅ Manual enrollment created with automatic session schedule generation:', enrollmentId);
      
      // Reset form
      setFormData({
        studentPhone: '',
        studentName: '',
        studentEmail: '',
        batchId: '',
        packageType: '',
        packageDuration: '',
        sessionsTotal: 0,
        paymentAmount: 0,
        paymentMethod: 'cash',
        notes: '',
      });
      setSelectedStudent(null);
      setSearchPhone('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Manual Student Enrollment</h2>
          <p className="text-gray-300">Enroll students directly into batches</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <UserPlus className="w-4 h-4" />
          <span>Admin Enrollment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Selection
          </h3>

          {/* Search Existing Student */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Existing Student
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                />
                <button
                  onClick={handleSearchStudent}
                  className="px-4 py-2 bg-[#89D3EC] text-gray-900 rounded-lg hover:bg-[#7BC3D9] transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchedUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{searchedUser.name}</h4>
                    <p className="text-sm text-gray-400">{searchedUser.phone}</p>
                    {searchedUser.email && (
                      <p className="text-sm text-gray-400">{searchedUser.email}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Student ID: {searchedUser.studentId || 'Not assigned'}
                    </p>
                  </div>
                  <button
                    onClick={handleSelectExistingStudent}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Select
                  </button>
                </div>
              </motion.div>
            )}

            {searchPhone && !searchedUser && (
              <div className="text-center py-4 text-gray-400">
                <p>No student found with this phone number</p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-sm text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            {/* Create New Student */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Create New Student</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.studentPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentPhone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                />
              </div>

              <button
                onClick={handleCreateNewStudent}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add New Student
              </button>
            </div>

            {/* Selected Student Display */}
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/20 border border-green-600 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Selected Student</span>
                </div>
                <div className="text-white">
                  <p className="font-medium">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-300">{selectedStudent.phone}</p>
                  {selectedStudent.email && (
                    <p className="text-sm text-gray-300">{selectedStudent.email}</p>
                  )}
                  {selectedStudent.isNew && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      New Student
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Enrollment Details */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Enrollment Details
          </h3>

          <div className="space-y-4">
            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Batch *
              </label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
              >
                <option value="">Choose a batch</option>
                {allBatches?.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} - {batch.sport?.name} ({batch.location?.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Package *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {packageOptions.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.packageType === pkg.name
                        ? 'border-[#89D3EC] bg-[#89D3EC]/10 text-[#89D3EC]'
                        : 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm opacity-75">{pkg.sessions} sessions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{pkg.price}</p>
                        <p className="text-xs opacity-75">{pkg.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitEnrollment}
              disabled={isLoading || !selectedStudent || !formData.batchId || !formData.packageType}
              className="w-full px-4 py-3 bg-[#89D3EC] text-gray-900 rounded-lg hover:bg-[#7BC3D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {isLoading ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEnrollment;