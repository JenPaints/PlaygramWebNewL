import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface UserEnrollmentStatus {
  hasActiveEnrollments: boolean;
  enrollments: any[];
  totalEnrollments: number;
  activeSports: string[];
}

export class UserEnrollmentService {
  private static instance: UserEnrollmentService;
  private convexClient: ConvexReactClient | null = null;

  static getInstance(): UserEnrollmentService {
    if (!UserEnrollmentService.instance) {
      UserEnrollmentService.instance = new UserEnrollmentService();
    }
    return UserEnrollmentService.instance;
  }

  setConvexClient(client: ConvexReactClient) {
    this.convexClient = client;
  }

  async checkUserEnrollmentStatus(phoneNumber: string): Promise<UserEnrollmentStatus> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      // Query user enrollments
      const enrollments = await this.convexClient.query(api.enrollments.getEnrollmentsByPhone, {
        phoneNumber
      });

      const activeEnrollments = enrollments.filter(e => e.status === 'active');
      const activeSports = [...new Set(activeEnrollments.map(e => e.sport))];

      return {
        hasActiveEnrollments: activeEnrollments.length > 0,
        enrollments: enrollments || [],
        totalEnrollments: enrollments.length,
        activeSports
      };
    } catch (error) {
      console.error('Error checking user enrollment status:', error);
      return {
        hasActiveEnrollments: false,
        enrollments: [],
        totalEnrollments: 0,
        activeSports: []
      };
    }
  }

  async getUserSessionDetails(phoneNumber: string) {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      const enrollments = await this.convexClient.query(api.enrollments.getEnrollmentsByPhone, {
        phoneNumber
      });

      const activeEnrollments = enrollments.filter(e => e.status === 'active');

      // Mock session details for now - in a real app, you'd have a sessions table
      const sessionDetails = activeEnrollments.map(enrollment => ({
        sport: enrollment.sport,
        planDuration: enrollment.planDuration,
        courtLocation: enrollment.courtLocation,
        enrollmentDate: enrollment.enrollmentDate,
        sessionStartDate: enrollment.sessionStartDate,
        status: enrollment.status,
        // Mock upcoming sessions
        upcomingSessions: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            time: '6:00 PM',
            location: enrollment.courtLocation || 'TBD',
            coach: 'Coach Rajesh'
          },
          {
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Day after tomorrow
            time: '6:00 PM', 
            location: enrollment.courtLocation || 'TBD',
            coach: 'Coach Rajesh'
          }
        ]
      }));

      return sessionDetails;
    } catch (error) {
      console.error('Error getting user session details:', error);
      return [];
    }
  }
}

export const userEnrollmentService = UserEnrollmentService.getInstance();