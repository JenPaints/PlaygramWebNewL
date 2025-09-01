/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as automatedNotifications from "../automatedNotifications.js";
import type * as batchChat from "../batchChat.js";
import type * as batches from "../batches.js";
import type * as bookings from "../bookings.js";
import type * as carouselImages from "../carouselImages.js";
import type * as coachBatches from "../coachBatches.js";
import type * as coachManagement from "../coachManagement.js";
import type * as debugPayment from "../debugPayment.js";
import type * as enquiries from "../enquiries.js";
import type * as enrollmentFixer from "../enrollmentFixer.js";
import type * as enrollmentPayments from "../enrollmentPayments.js";
import type * as enrollments from "../enrollments.js";
import type * as fixEnrollments from "../fixEnrollments.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as loginSessions from "../loginSessions.js";
import type * as merchandise from "../merchandise.js";
import type * as merchandiseOrders from "../merchandiseOrders.js";
import type * as notifications from "../notifications.js";
import type * as paymentTracking from "../paymentTracking.js";
import type * as payments from "../payments.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as razorpayOrders from "../razorpayOrders.js";
import type * as referralCodeGenerator from "../referralCodeGenerator.js";
import type * as referrals from "../referrals.js";
import type * as router from "../router.js";
import type * as scheduledNotifications from "../scheduledNotifications.js";
import type * as seedData from "../seedData.js";
import type * as sessionAdjustments from "../sessionAdjustments.js";
import type * as sessionSchedules from "../sessionSchedules.js";
import type * as sports from "../sports.js";
import type * as sportsPrograms from "../sportsPrograms.js";
import type * as studentIdGenerator from "../studentIdGenerator.js";
import type * as testimonials from "../testimonials.js";
import type * as trialBookings from "../trialBookings.js";
import type * as userActivities from "../userActivities.js";
import type * as userDataFixer from "../userDataFixer.js";
import type * as userEnrollments from "../userEnrollments.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  automatedNotifications: typeof automatedNotifications;
  batchChat: typeof batchChat;
  batches: typeof batches;
  bookings: typeof bookings;
  carouselImages: typeof carouselImages;
  coachBatches: typeof coachBatches;
  coachManagement: typeof coachManagement;
  debugPayment: typeof debugPayment;
  enquiries: typeof enquiries;
  enrollmentFixer: typeof enrollmentFixer;
  enrollmentPayments: typeof enrollmentPayments;
  enrollments: typeof enrollments;
  fixEnrollments: typeof fixEnrollments;
  http: typeof http;
  locations: typeof locations;
  loginSessions: typeof loginSessions;
  merchandise: typeof merchandise;
  merchandiseOrders: typeof merchandiseOrders;
  notifications: typeof notifications;
  paymentTracking: typeof paymentTracking;
  payments: typeof payments;
  pushNotifications: typeof pushNotifications;
  razorpayOrders: typeof razorpayOrders;
  referralCodeGenerator: typeof referralCodeGenerator;
  referrals: typeof referrals;
  router: typeof router;
  scheduledNotifications: typeof scheduledNotifications;
  seedData: typeof seedData;
  sessionAdjustments: typeof sessionAdjustments;
  sessionSchedules: typeof sessionSchedules;
  sports: typeof sports;
  sportsPrograms: typeof sportsPrograms;
  studentIdGenerator: typeof studentIdGenerator;
  testimonials: typeof testimonials;
  trialBookings: typeof trialBookings;
  userActivities: typeof userActivities;
  userDataFixer: typeof userDataFixer;
  userEnrollments: typeof userEnrollments;
  users: typeof users;
  waitlist: typeof waitlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
