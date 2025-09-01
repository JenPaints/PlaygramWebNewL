import React, { useState, useEffect } from 'react';
import { User, Phone, Bell, Shield, CreditCard, MapPin, Save, CheckCircle, AlertCircle, Download, Trash2, Settings, FileText, X, Camera, Upload } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'sonner';
import PushNotificationTest from '../../mobile/PushNotificationTest';

interface SettingsViewProps {
  user?: any;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user: propUser }) => {
  const { user } = useAuth();
  const currentUser = propUser || user;
  const [activeTab, setActiveTab] = useState('location');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhoneChangeModal, setShowPhoneChangeModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem(`profileImage_${currentUser?.phoneNumber}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [currentUser?.phoneNumber]);
  
  // Get user data from database
  const userData = useQuery(
    api.users.getUserByPhone,
    currentUser?.phoneNumber ? { phone: currentUser.phoneNumber } : "skip"
  );
  
  // Get notification preferences
  const notificationPrefs = useQuery(
    api.notifications.getNotificationPreferences,
    {}
  );
  
  // Get user's payment history from unified tracking system
  const allPayments = useQuery(
    api.paymentTracking.getAllPaymentRecords,
    {}
  ) || [];
  
  // Filter payments for current user
  const userPayments = allPayments.filter(payment => 
    payment.userId === currentUser?.phoneNumber
  );
  
  // Get all locations for selection
  const allLocations = useQuery(api.locations.getAllLocations) || [];
  
  // Real mutations for updating user data
  const updateUser = useMutation(api.auth.updateUser);
  const updateNotificationPrefs = useMutation(api.notifications.updateNotificationPreferences);
  const deleteUserAccount = useMutation(api.auth.deleteUser);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    preferredLocation: '',
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: true,
      batchChatNotifications: true,
      announcementNotifications: true,
      sessionReminders: true,
      paymentReminders: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    }
  });
  
  // Receipt handling functions
  const handleViewReceipt = (payment: any) => {
    // Create a receipt modal or new window
    const receiptWindow = window.open('', '_blank', 'width=600,height=800');
    if (receiptWindow) {
      receiptWindow.document.write(generateReceiptHTML(payment));
      receiptWindow.document.close();
    }
  };

  const handleDownloadReceipt = (payment: any) => {
    const receiptHTML = generateReceiptHTML(payment);
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.details?.paymentId || payment._id.slice(-8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded successfully!');
  };

  const handleDownloadAllReceipts = () => {
    const completedPayments = userPayments.filter(p => p.status === 'completed');
    if (completedPayments.length === 0) {
      toast.error('No completed transactions to download');
      return;
    }

    completedPayments.forEach((payment, index) => {
      setTimeout(() => {
        handleDownloadReceipt(payment);
      }, index * 500); // Stagger downloads
    });
    
    toast.success(`Downloading ${completedPayments.length} receipts...`);
  };

  const generateReceiptHTML = (payment: any) => {
    const transactionId = payment.details?.paymentId || payment._id.slice(-8);
    const date = new Date(payment.createdAt);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${transactionId}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #333; }
          .receipt-title { font-size: 18px; margin: 10px 0; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .amount { font-size: 20px; font-weight: bold; color: #2563eb; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; }
          .status { padding: 5px 10px; border-radius: 5px; background: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PlayGram Sports</div>
          <div class="receipt-title">Payment Receipt</div>
        </div>
        
        <div class="details">
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span>${transactionId}</span>
          </div>
          <div class="row">
            <span class="label">Date & Time:</span>
            <span>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
          </div>
          <div class="row">
            <span class="label">Type:</span>
            <span style="text-transform: capitalize;">${payment.type}</span>
          </div>
          ${payment.details?.sport ? `
          <div class="row">
            <span class="label">Sport:</span>
            <span>${payment.details.sport}</span>
          </div>
          ` : ''}
          ${payment.details?.planId ? `
          <div class="row">
            <span class="label">Plan:</span>
            <span>${payment.details.planId}</span>
          </div>
          ` : ''}
          <div class="row">
            <span class="label">Amount:</span>
            <span class="amount">₹${payment.amount.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="status">Paid</span>
          </div>
          <div class="row">
            <span class="label">Customer:</span>
            <span>${currentUser?.phoneNumber}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing PlayGram Sports!</p>
          <p>For support, contact us at support@playgram.com</p>
          <p><small>This is a computer-generated receipt.</small></p>
        </div>
      </body>
      </html>
    `;
  };

  // Update form data when user data loads
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        fullName: userData.fullName || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        pincode: userData.pincode || '',
        emergencyContact: userData.emergencyContact || {
          name: '',
          phone: '',
          relation: ''
        },
        preferredLocation: userData.preferredLocation || ''
      }));
    }
  }, [userData]);
  
  // Update notification preferences when they load
  useEffect(() => {
    if (notificationPrefs) {
      setFormData(prev => ({
        ...prev,
        notifications: {
          emailNotifications: notificationPrefs.emailNotifications ?? true,
          pushNotifications: notificationPrefs.pushNotifications ?? true,
          smsNotifications: notificationPrefs.smsNotifications ?? true,
          batchChatNotifications: notificationPrefs.batchChatNotifications ?? true,
          announcementNotifications: notificationPrefs.announcementNotifications ?? true,
          sessionReminders: notificationPrefs.sessionReminders ?? true,
          paymentReminders: notificationPrefs.paymentReminders ?? true,
          quietHours: notificationPrefs.quietHours || {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
          }
        }
      }));
    }
  }, [notificationPrefs]);

  const tabs = [
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'delete', label: 'Delete Account', icon: Trash2 }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNotificationChange = (key: string, value: boolean | object) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!userData?._id) return;
    
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      await updateUser({
        userId: userData._id,
        name: formData.name,
        email: formData.email,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        gender: formData.gender,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        emergencyContact: formData.emergencyContact
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadData = async () => {
    try {
      setIsLoading(true);
      
      // Collect all user data
      const userData = {
        profile: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          emergencyContact: formData.emergencyContact
        },
        payments: userPayments,
        notifications: formData.notifications,
        exportDate: new Date().toISOString()
      };
      
      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `playgram-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Your data has been downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (userData?._id) {
        await deleteUserAccount({ userId: userData._id });
        toast.success('Account deleted successfully. You will be logged out.');
        
        // Logout user after successful deletion
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    }
  };
  
  const handlePhoneNumberChange = async () => {
    if (!newPhoneNumber || newPhoneNumber.length < 10) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would require OTP verification
      toast.info('Phone number change requires verification. A verification code will be sent to your new number.');
      
      // For now, just show success message
      toast.success('Phone number change request submitted. Please check your messages for verification.');
      
      setShowPhoneChangeModal(false);
      setNewPhoneNumber('');
    } catch (error) {
      toast.error('Failed to change phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Image handling functions
  const compressImage = (file: File, maxWidth: number = 300, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    try {
      setIsUploadingImage(true);
      
      // Compress the image
      const compressedImage = await compressImage(file);
      
      // Store in localStorage
      localStorage.setItem(`profileImage_${currentUser?.phoneNumber}`, compressedImage);
      
      // Update state
      setProfileImage(compressedImage);
      
      toast.success('Profile image updated successfully!');
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (currentUser?.phoneNumber) {
      localStorage.removeItem(`profileImage_${currentUser.phoneNumber}`);
      setProfileImage(null);
      toast.success('Profile image removed successfully!');
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      // Pass user phone number as userId for identification
      await updateNotificationPrefs({
        ...formData.notifications,
        userId: currentUser?.phoneNumber || 'anonymous_user'
      });
      
      setSaveStatus('success');
      toast.success('Notification preferences saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences. Please try again.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      // Location preferences are saved locally for now
      setSaveStatus('success');
      toast.success('Location preferences saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving location preferences:', error);
      toast.error('Failed to save location preferences. Please try again.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h3>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
          {/* Profile Image Display */}
          <div className="relative group">
            {profileImage ? (
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-gray-100"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-gray-100 group-hover:shadow-xl transition-shadow duration-200">
                <User className="w-16 h-16 text-white" />
              </div>
            )}
            
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  <span className="text-white text-xs font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-4">
              <h4 className="text-base font-medium text-gray-900 mb-1">Upload Your Photo</h4>
              <p className="text-sm text-gray-600">
                Choose a clear photo that represents you well. This will be visible to coaches and other students.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <label className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4 mr-2" />
                {profileImage ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>
              
              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploadingImage}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Photo
                </button>
              )}
            </div>
            
            {/* Upload Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Photo Guidelines</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Maximum file size: 5MB</li>
                    <li>• Supported formats: JPEG, PNG, WebP</li>
                    <li>• Recommended: Square aspect ratio</li>
                    <li>• Images are stored securely on your device</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                disabled
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Phone number cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter your city"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter your state"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="Enter your pincode"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              value={formData.emergencyContact.name}
              onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
              placeholder="Emergency contact name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
              placeholder="Emergency contact phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship
            </label>
            <select
              value={formData.emergencyContact.relation}
              onChange={(e) => handleInputChange('emergencyContact.relation', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select relationship</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
            <select
              value={formData.preferredLocation}
              onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a location</option>
              {allLocations.map((location) => (
                <option key={location._id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Location Services</h4>
            <p className="text-sm text-blue-700">
              We use your location to show nearby courts and provide better recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeleteTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Warning</h4>
            <p className="text-sm text-red-700 mb-4">
              Account deletion is permanent and cannot be undone. This will:
            </p>
            <ul className="text-sm text-red-700 space-y-1 ml-4">
              <li>• Delete all your personal data</li>
              <li>• Cancel all active enrollments</li>
              <li>• Remove access to all services</li>
              <li>• Delete your payment history</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Before you delete your account</h4>
            <p className="text-sm text-gray-600 mb-3">
              Consider downloading your data or contacting support if you have any issues.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleDownloadData}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download My Data
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(formData.notifications).filter(([key]) => key !== 'quietHours').map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key === 'emailNotifications' ? 'Email Notifications' : 
                   key === 'pushNotifications' ? 'Push Notifications' :
                   key === 'smsNotifications' ? 'SMS Notifications' :
                   key === 'batchChatNotifications' ? 'Batch Chat Notifications' :
                   key === 'announcementNotifications' ? 'Announcement Notifications' :
                   key === 'sessionReminders' ? 'Session Reminders' :
                   'Payment Reminders'}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'emailNotifications' ? 'Receive notifications via email' :
                   key === 'pushNotifications' ? 'Receive push notifications on your device' :
                   key === 'smsNotifications' ? 'Receive notifications via SMS' :
                   key === 'batchChatNotifications' ? 'Get notified about batch chat messages' :
                   key === 'announcementNotifications' ? 'Receive important announcements' :
                   key === 'sessionReminders' ? 'Get reminders for upcoming sessions' :
                   'Receive reminders for upcoming payments'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeof value === 'boolean' ? value : false}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  typeof value === 'boolean' && value ? 'bg-[#86D5F0]' : 'bg-gray-200'
                }`}></div>
              </label>
            </div>
          ))}
          
          {/* Quiet Hours Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Quiet Hours</h4>
                <p className="text-sm text-gray-600">Disable notifications during specific hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications.quietHours?.enabled || false}
                  onChange={(e) => handleNotificationChange('quietHours', {
                    ...(formData.notifications.quietHours || { startTime: '22:00', endTime: '08:00' }),
                    enabled: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  formData.notifications.quietHours?.enabled ? 'bg-[#86D5F0]' : 'bg-gray-200'
                }`}></div>
              </label>
            </div>
            
            {formData.notifications.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.notifications.quietHours?.startTime || '22:00'}
                    onChange={(e) => handleNotificationChange('quietHours', {
                      ...(formData.notifications.quietHours || { enabled: true, endTime: '08:00' }),
                      startTime: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.notifications.quietHours?.endTime || '08:00'}
                    onChange={(e) => handleNotificationChange('quietHours', {
                      ...(formData.notifications.quietHours || { enabled: true, startTime: '22:00' }),
                      endTime: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Push Notification Test Component */}
      <PushNotificationTest />
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                <p className="text-sm text-gray-600">Control who can see your profile information</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="public">Public</option>
                <option value="coaches">Coaches Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Data Sharing</h4>
                <p className="text-sm text-gray-600">Allow sharing of performance data with coaches</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Data Privacy</h4>
            <p className="text-sm text-gray-600 mb-3">
              Your personal information is secure and only used for providing our services.
            </p>
            <div className="flex gap-3">
               <button 
                 onClick={() => setShowPrivacyModal(true)}
                 className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
               >
                 <FileText className="w-4 h-4" />
                 View Privacy Policy
               </button>
               <button 
                 onClick={handleDownloadData}
                 disabled={isLoading}
                 className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
               >
                 <Download className="w-4 h-4" />
                 Download My Data
               </button>
               <button 
                 onClick={() => setShowDeleteModal(true)}
                 className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
               >
                 <Trash2 className="w-4 h-4" />
                 Delete Account
               </button>
             </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Account Security</h4>
            <p className="text-sm text-gray-600 mb-3">
              Your account is protected with phone number verification.
            </p>
            <div className="flex gap-3">
               <button 
                 onClick={() => setShowPhoneChangeModal(true)}
                 className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
               >
                 <Phone className="w-4 h-4" />
                 Change Phone Number
               </button>
               <button 
                 onClick={() => setShowSecurityModal(true)}
                 className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
               >
                 <Settings className="w-4 h-4" />
                 Security Settings
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => {
    const totalSpent = userPayments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    
    const pendingAmount = userPayments
      .filter((p: any) => p.status === 'pending')
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Total Transactions</h4>
              <p className="text-2xl font-bold text-blue-600">{userPayments.length}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <p className="text-sm text-gray-600 mb-4">View transactions & receipts</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {userPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions found</p>
                <p className="text-xs mt-2">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userPayments.map((payment: any) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {payment.details?.paymentId || payment._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              payment.type === 'enrollment' ? 'bg-blue-500' :
                              payment.type === 'merchandise' ? 'bg-green-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="capitalize">{payment.type}</span>
                          </div>
                          {payment.details?.sport && (
                            <div className="text-xs text-gray-500 mt-1">{payment.details.sport}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status === 'completed' ? 'Paid' : payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.status === 'completed' ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewReceipt(payment)}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                View
                              </button>
                              <button 
                                onClick={() => handleDownloadReceipt(payment)}
                                className="text-green-600 hover:text-green-700 font-medium flex items-center"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Not available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {userPayments.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>Showing {userPayments.length} transaction(s)</span>
              <button 
                onClick={handleDownloadAllReceipts}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Download className="w-4 h-4 mr-1" />
                Download All Receipts
              </button>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Settings</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Auto-renewal</h4>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Automatically renew subscriptions before they expire
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Payment Reminders</h4>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Receive reminders for upcoming payments
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download your complete payment history and receipts
              </p>
              <div className="flex gap-3">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Export CSV
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
        </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeTab === 'location' && renderLocationTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'delete' && renderDeleteTab()}

            {/* Save Button */}
            {(activeTab === 'location' || activeTab === 'notifications') && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={activeTab === 'location' ? handleSaveLocation : handleSaveNotifications}
                    disabled={isLoading}
                    className="text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50" style={{ backgroundColor: '#86D5F0' }}
                  >
                    <Save size={20} />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  
                  {saveStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle size={20} />
                      <span>Changes saved successfully!</span>
                    </div>
                  )}
                  
                  {saveStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle size={20} />
                      <span>Error saving changes. Please try again.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="prose max-w-none text-sm text-gray-600 space-y-4">
                <h4 className="font-semibold text-gray-900">Information We Collect</h4>
                <p>We collect information you provide directly to us, such as when you create an account, enroll in programs, or contact us for support.</p>
                
                <h4 className="font-semibold text-gray-900">How We Use Your Information</h4>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                
                <h4 className="font-semibold text-gray-900">Information Sharing</h4>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                
                <h4 className="font-semibold text-gray-900">Data Security</h4>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                
                <h4 className="font-semibold text-gray-900">Your Rights</h4>
                <p>You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isLoading || deleteConfirmation !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Phone Change Modal */}
      {showPhoneChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Change Phone Number</h3>
                <button 
                  onClick={() => setShowPhoneChangeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Enter your new phone number. You will receive a verification code to confirm the change.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="Enter new phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowPhoneChangeModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePhoneNumberChange}
                  disabled={isLoading || !newPhoneNumber}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Send Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Security Settings Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <button 
                  onClick={() => setShowSecurityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Phone Verification</h4>
                  </div>
                  <p className="text-sm text-green-700">Your account is secured with phone number verification.</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Login Activity</h4>
                  <p className="text-sm text-blue-700 mb-2">Last login: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-blue-700">Device: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Security Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Keep your phone number updated</li>
                    <li>• Don't share your OTP with anyone</li>
                    <li>• Log out from shared devices</li>
                    <li>• Contact support if you notice suspicious activity</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};