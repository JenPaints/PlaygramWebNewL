import { TrialBookingData, TrialUserDetails, TrialSport } from '../types';

// Mock service for now - will be replaced with actual Convex integration
const MOCK_BOOKINGS_KEY = 'trial_bookings_mock';

export interface CreateTrialBookingRequest {
  phoneNumber: string;
  sport: TrialSport;
  selectedDate: Date;
  userDetails: TrialUserDetails;
  courtLocation?: string;
}

export interface TrialBookingResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
}

// Mock storage functions
const getMockBookings = (): any[] => {
  const stored = localStorage.getItem(MOCK_BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMockBookings = (bookings: any[]) => {
  localStorage.setItem(MOCK_BOOKINGS_KEY, JSON.stringify(bookings));
};

export const trialBookingService = {
  // Create a new trial booking
  async createTrialBooking(data: CreateTrialBookingRequest): Promise<TrialBookingResponse> {
    try {
      const bookings = getMockBookings();
      
      // Check if phone number already has a trial booking
      const existingBooking = bookings.find(b => b.phoneNumber === data.phoneNumber);
      if (existingBooking) {
        return {
          success: false,
          error: 'This phone number has already booked a free trial. Each number can only book one trial.'
        };
      }

      // Create the trial booking
      const newBooking = {
        _id: `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber: data.phoneNumber,
        sport: data.sport,
        selectedDate: data.selectedDate.getTime(),
        userDetails: data.userDetails,
        status: 'confirmed' as const,
        courtLocation: data.courtLocation || 'HSR Football Court, HSR Layout, Bangalore',
        bookingDate: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      bookings.push(newBooking);
      saveMockBookings(bookings);

      return {
        success: true,
        bookingId: newBooking._id
      };
    } catch (error) {
      console.error('Failed to create trial booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trial booking'
      };
    }
  },

  // Check if phone number already has a trial booking
  async checkExistingBooking(phoneNumber: string): Promise<boolean> {
    try {
      const bookings = getMockBookings();
      return bookings.some(b => b.phoneNumber === phoneNumber);
    } catch (error) {
      console.error('Failed to check existing booking:', error);
      return false;
    }
  },

  // Get trial booking by ID
  async getTrialBooking(bookingId: string) {
    try {
      const bookings = getMockBookings();
      return bookings.find(b => b._id === bookingId) || null;
    } catch (error) {
      console.error('Failed to get trial booking:', error);
      return null;
    }
  },

  // Get trial bookings by phone number
  async getTrialBookingsByPhone(phoneNumber: string) {
    try {
      const bookings = getMockBookings();
      return bookings.filter(b => b.phoneNumber === phoneNumber);
    } catch (error) {
      console.error('Failed to get trial bookings by phone:', error);
      return [];
    }
  },

  // Get trial bookings for a specific date and sport (to check availability)
  async getTrialBookingsForSlot(sport: TrialSport, date: Date) {
    try {
      const bookings = getMockBookings();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return bookings.filter(b => 
        b.sport === sport && 
        b.selectedDate >= startOfDay.getTime() && 
        b.selectedDate <= endOfDay.getTime()
      );
    } catch (error) {
      console.error('Failed to get trial bookings for slot:', error);
      return [];
    }
  },

  // Cancel trial booking
  async cancelTrialBooking(bookingId: string, reason?: string): Promise<TrialBookingResponse> {
    try {
      const bookings = getMockBookings();
      const bookingIndex = bookings.findIndex(b => b._id === bookingId);
      
      if (bookingIndex === -1) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      bookings[bookingIndex].status = 'cancelled';
      bookings[bookingIndex].cancellationReason = reason;
      bookings[bookingIndex].updatedAt = Date.now();
      
      saveMockBookings(bookings);
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel trial booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking'
      };
    }
  },

  // Update trial booking status
  async updateTrialBookingStatus(
    bookingId: string, 
    status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  ): Promise<TrialBookingResponse> {
    try {
      const bookings = getMockBookings();
      const bookingIndex = bookings.findIndex(b => b._id === bookingId);
      
      if (bookingIndex === -1) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      bookings[bookingIndex].status = status;
      bookings[bookingIndex].updatedAt = Date.now();
      
      saveMockBookings(bookings);
      return { success: true };
    } catch (error) {
      console.error('Failed to update trial booking status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking status'
      };
    }
  },

  // Get trial booking statistics (for admin)
  async getTrialBookingStats() {
    try {
      const bookings = getMockBookings();
      
      const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        noShow: bookings.filter(b => b.status === 'no-show').length,
        byMonth: {} as Record<string, number>,
        bySport: {
          football: bookings.filter(b => b.sport === 'football').length,
          basketball: bookings.filter(b => b.sport === 'basketball').length,
        }
      };
      
      // Group by month
      bookings.forEach(booking => {
        const date = new Date(booking.selectedDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to get trial booking stats:', error);
      return null;
    }
  },

  // Get all trial bookings (for admin)
  async getAllTrialBookings(limit?: number, status?: 'confirmed' | 'cancelled' | 'completed' | 'no-show') {
    try {
      let bookings = getMockBookings();
      
      if (status) {
        bookings = bookings.filter(b => b.status === status);
      }
      
      // Sort by creation date (newest first)
      bookings.sort((a, b) => b.createdAt - a.createdAt);
      
      if (limit) {
        bookings = bookings.slice(0, limit);
      }
      
      return bookings;
    } catch (error) {
      console.error('Failed to get all trial bookings:', error);
      return [];
    }
  }
};