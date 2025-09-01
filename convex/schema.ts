import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  sports: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    trialPrice: v.number(),
    features: v.array(v.string()),
    videoUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }),
  
  bookings: defineTable({
    sportId: v.id("sports"),
    type: v.union(v.literal("trial"), v.literal("enrollment")),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    scheduledDate: v.optional(v.number()),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.optional(v.string()),
  }),

  testimonials: defineTable({
    name: v.string(),
    sport: v.string(),
    rating: v.number(),
    comment: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  enquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    sport: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("resolved")),
  }),

  waitlist: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    sport: v.string(),
    status: v.union(v.literal("pending"), v.literal("notified"), v.literal("converted")),
    source: v.optional(v.string()),
  }),

  enrollments: defineTable({
    phoneNumber: v.string(),
    sport: v.union(v.literal("football"), v.literal("basketball"), v.literal("badminton"), v.literal("swimming")),
    planId: v.string(),
    planDuration: v.optional(v.union(v.literal("1-month"), v.literal("3-month"), v.literal("12-month"))),
    paymentId: v.optional(v.string()),
    orderId: v.optional(v.string()),
    paymentAmount: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("cancelled")),
    enrollmentDate: v.number(),
    sessionStartDate: v.optional(v.number()),
    courtLocation: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phone", ["phoneNumber"])
    .index("by_payment", ["paymentId"])
    .index("by_status", ["status"]),

  payment_orders: defineTable({
    razorpayOrderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    receipt: v.string(),
    status: v.union(v.literal("created"), v.literal("attempted"), v.literal("paid"), v.literal("failed")),
    planId: v.string(),
    userPhone: v.string(),
    sport: v.string(),
    notes: v.object({}),
    razorpayPaymentId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order_id", ["razorpayOrderId"])
    .index("by_phone", ["userPhone"])
    .index("by_status", ["status"]),

  payment_records: defineTable({
    enrollmentId: v.id("enrollments"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("created"), v.literal("authorized"), v.literal("captured"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_payment_id", ["razorpayPaymentId"])
    .index("by_order_id", ["razorpayOrderId"])
    .index("by_enrollment", ["enrollmentId"]),

  trialBookings: defineTable({
    phoneNumber: v.string(),
    sport: v.union(v.literal("football"), v.literal("basketball")),
    selectedDate: v.number(), // timestamp
    userDetails: v.object({
      name: v.string(),
      age: v.number(),
      email: v.string(),
      phoneNumber: v.string(),
    }),
    status: v.union(v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("no-show")),
    courtLocation: v.string(),
    bookingDate: v.number(),
    cancellationReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phone", ["phoneNumber"])
    .index("by_date", ["selectedDate"])
    .index("by_sport_date", ["sport", "selectedDate"])
    .index("by_status", ["status"]),

  merchandise: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.string(),
    sizes: v.array(v.string()),
    colors: v.array(v.string()),
    stockQuantity: v.number(),
    isActive: v.boolean(),
    isFeatured: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_stock", ["stockQuantity"])
    .index("by_featured", ["isFeatured"]),

  merchandiseOrders: defineTable({
    orderNumber: v.string(),
    customerPhone: v.string(),
    customerName: v.string(),
    items: v.array(v.object({
      merchandiseId: v.id("merchandise"),
      quantity: v.number(),
      size: v.optional(v.string()),
      color: v.optional(v.string()),
      price: v.number(),
    })),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("ready_for_collection"),
      v.literal("collected"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    collectionDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_customer", ["customerPhone"])
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_razorpay_order", ["razorpayOrderId"]),

  locations: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    imageUrl: v.optional(v.string()),
    facilities: v.array(v.string()),
    contactPhone: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_city", ["city"])
    .index("by_active", ["isActive"]),

  sportsPrograms: defineTable({
    name: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    ageGroups: v.array(v.string()),
    skillLevels: v.array(v.string()),
    equipment: v.array(v.string()),
    benefits: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  batches: defineTable({
    sportId: v.id("sportsPrograms"),
    locationId: v.id("locations"),
    name: v.string(),
    description: v.optional(v.string()),
    coachName: v.string(),
    coachImage: v.optional(v.string()),
    ageGroup: v.string(),
    skillLevel: v.string(),
    maxCapacity: v.number(),
    currentEnrollments: v.number(),
    schedule: v.array(v.object({
      day: v.string(), // Monday, Tuesday, etc.
      startTime: v.string(), // "18:00"
      endTime: v.string(), // "19:30"
    })),
    packages: v.array(v.object({
      duration: v.string(), // "1 month", "3 months", etc.
      price: v.number(),
      sessions: v.number(),
      features: v.array(v.string()),
    })),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_sport", ["sportId"])
    .index("by_location", ["locationId"])
    .index("by_active", ["isActive"])
    .index("by_sport_location", ["sportId", "locationId"]),

  userEnrollments: defineTable({
    userId: v.id("users"),
    batchId: v.id("batches"),
    packageType: v.string(),
    packageDuration: v.string(),
    sessionsTotal: v.number(),
    sessionsAttended: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    paymentAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    enrollmentStatus: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_batch", ["batchId"])
    .index("by_user_batch", ["userId", "batchId"])
    .index("by_status", ["enrollmentStatus"])
    .index("by_payment_status", ["paymentStatus"]),

  attendanceRecords: defineTable({
     enrollmentId: v.id("userEnrollments"),
     sessionDate: v.number(),
     status: v.union(
       v.literal("present"),
       v.literal("absent"),
       v.literal("late"),
       v.literal("excused")
     ),
     notes: v.optional(v.string()),
     markedBy: v.optional(v.string()), // Coach/Admin who marked attendance
     createdAt: v.number(),
   }).index("by_enrollment", ["enrollmentId"])
     .index("by_session_date", ["sessionDate"])
     .index("by_enrollment_date", ["enrollmentId", "sessionDate"]),

  sessionSchedules: defineTable({
    enrollmentId: v.id("userEnrollments"),
    batchId: v.id("batches"),
    sessionNumber: v.number(), // 1, 2, 3... up to total sessions
    scheduledDate: v.number(),
    scheduledStartTime: v.string(), // "18:00"
    scheduledEndTime: v.string(), // "19:30"
    status: v.union(
      v.literal("scheduled"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("cancelled")
    ),
    isPaused: v.boolean(),
    pausedAt: v.optional(v.number()),
    pausedReason: v.optional(v.string()),
    rescheduledFrom: v.optional(v.number()), // Original date if rescheduled
    canPause: v.boolean(), // Can pause until 2 hours before
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_enrollment", ["enrollmentId"])
    .index("by_batch", ["batchId"])
    .index("by_scheduled_date", ["scheduledDate"])
    .index("by_status", ["status"])
    .index("by_enrollment_session", ["enrollmentId", "sessionNumber"])
    .index("by_batch_date", ["batchId", "scheduledDate"]),

  pauseRequests: defineTable({
     enrollmentId: v.id("userEnrollments"),
     sessionScheduleId: v.id("sessionSchedules"),
     requestedAt: v.number(),
     sessionDate: v.number(),
     reason: v.optional(v.string()),
     status: v.union(
       v.literal("pending"),
       v.literal("approved"),
       v.literal("rejected"),
       v.literal("expired")
     ),
     pausesUsed: v.number(), // Track how many pauses used (max 2)
     rescheduledToDate: v.optional(v.number()),
     processedAt: v.optional(v.number()),
     processedBy: v.optional(v.string()),
     createdAt: v.number(),
     updatedAt: v.number(),
   }).index("by_enrollment", ["enrollmentId"])
     .index("by_session_schedule", ["sessionScheduleId"])
     .index("by_status", ["status"])
     .index("by_session_date", ["sessionDate"]),

   coachAssignments: defineTable({
     coachId: v.id("users"), // Coach user ID
     batchId: v.id("batches"), // Assigned batch
     assignedBy: v.id("users"), // Admin who made the assignment
     assignedAt: v.number(),
     isActive: v.boolean(),
     notes: v.optional(v.string()),
     createdAt: v.number(),
     updatedAt: v.number(),
   }).index("by_coach", ["coachId"])
     .index("by_batch", ["batchId"])
     .index("by_coach_batch", ["coachId", "batchId"])
     .index("by_active", ["isActive"]),

   loginSessions: defineTable({
     userId: v.id("users"),
     studentId: v.optional(v.string()), // PLYG123 format
     sessionId: v.string(),
     loginTime: v.number(),
     logoutTime: v.optional(v.number()),
     ipAddress: v.optional(v.string()),
     userAgent: v.optional(v.string()),
     deviceInfo: v.optional(v.object({
       deviceType: v.string(),
       browser: v.string(),
       os: v.string(),
       isMobile: v.boolean(),
     })),
     location: v.optional(v.object({
       country: v.string(),
       city: v.string(),
       latitude: v.optional(v.number()),
       longitude: v.optional(v.number()),
     })),
     loginMethod: v.union(
       v.literal("phone_otp"),
       v.literal("email"),
       v.literal("admin_created"),
       v.literal("social_login")
     ),
     sessionDuration: v.optional(v.number()),
     isActive: v.boolean(),
     createdAt: v.number(),
     updatedAt: v.number(),
   }).index("by_user", ["userId"])
     .index("by_student_id", ["studentId"])
     .index("by_session_id", ["sessionId"])
     .index("by_login_time", ["loginTime"])
     .index("by_active_sessions", ["isActive"])
     .index("by_login_method", ["loginMethod"]),

   userActivities: defineTable({
      userId: v.id("users"),
      studentId: v.optional(v.string()),
      sessionId: v.string(),
      activityType: v.union(
        v.literal("login"),
        v.literal("logout"),
        v.literal("enrollment"),
        v.literal("payment"),
        v.literal("profile_update"),
        v.literal("batch_view"),
        v.literal("coaching_view"),
        v.literal("merchandise_purchase"),
        v.literal("session_attendance")
      ),
      activityDetails: v.optional(v.object({
        description: v.string(),
        metadata: v.optional(v.any()),
        relatedId: v.optional(v.string()),
        relatedType: v.optional(v.string()),
      })),
      timestamp: v.number(),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }).index("by_user", ["userId"])
       .index("by_student_id", ["studentId"])
       .index("by_session", ["sessionId"])
       .index("by_activity_type", ["activityType"])
       .index("by_timestamp", ["timestamp"])
       .index("by_user_activity", ["userId", "activityType"]),

  // Batch Chat Messages
  batchChatMessages: defineTable({
    batchId: v.id("batches"),
    senderId: v.id("users"),
    senderType: v.union(
      v.literal("student"),
      v.literal("coach"),
      v.literal("admin")
    ),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("announcement")
    ),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    isAnnouncement: v.boolean(),
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    replyToMessageId: v.optional(v.id("batchChatMessages")),
    readBy: v.array(v.object({
      userId: v.id("users"),
      readAt: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_batch", ["batchId"])
    .index("by_sender", ["senderId"])
    .index("by_batch_time", ["batchId", "createdAt"])
    .index("by_message_type", ["messageType"])
    .index("by_announcement", ["isAnnouncement"])
    .index("by_reply_to", ["replyToMessageId"]),

  payments: defineTable({
    type: v.union(v.literal("enrollment"), v.literal("merchandise"), v.literal("trial")),
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("attempted"), v.literal("failed"), v.literal("completed")),
    details: v.object({
      orderId: v.optional(v.string()),
      paymentId: v.optional(v.string()),
      razorpayOrderId: v.optional(v.string()),
      razorpayPaymentId: v.optional(v.string()),
      enrollmentId: v.optional(v.union(v.id("enrollments"), v.id("userEnrollments"))),
      merchandiseOrderId: v.optional(v.id("merchandiseOrders")),
      notes: v.optional(v.object({})),
      sport: v.optional(v.string()),
      planId: v.optional(v.string()),
      sessionStartDate: v.optional(v.number()),
      courtLocation: v.optional(v.string()),
      orderNumber: v.optional(v.string()),
      items: v.optional(v.array(v.object({
        merchandiseId: v.id("merchandise"),
        quantity: v.number(),
        price: v.number(),
      }))),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),

  payment_logs: defineTable({
    action: v.string(),
    data: v.string(), // JSON stringified
    error: v.optional(v.string()),
    timestamp: v.number(),
    createdAt: v.number()
  }).index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"]),

  // System Notifications
  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("announcement")
    ),
    targetType: v.union(
      v.literal("all_users"),
      v.literal("all_students"),
      v.literal("all_coaches"),
      v.literal("all_admins"),
      v.literal("specific_user"),
      v.literal("batch_members"),
      v.literal("location_users")
    ),
    targetId: v.optional(v.string()), // userId, batchId, locationId based on targetType
    senderId: v.id("users"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    sentAt: v.number(),
    createdAt: v.number(),
  }).index("by_target_type", ["targetType"])
    .index("by_target_id", ["targetId"])
    .index("by_sender", ["senderId"])
    .index("by_priority", ["priority"])
    .index("by_read_status", ["isRead"])
    .index("by_sent_time", ["sentAt"])
    .index("by_expires", ["expiresAt"]),

  // User Notification Preferences
  notificationPreferences: defineTable({
    userId: v.id("users"),
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    smsNotifications: v.boolean(),
    batchChatNotifications: v.boolean(),
    announcementNotifications: v.boolean(),
    sessionReminders: v.boolean(),
    paymentReminders: v.boolean(),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.string(), // "22:00"
      endTime: v.string(), // "08:00"
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // User Notification Delivery Records
  userNotifications: defineTable({
    userId: v.id("users"),
    notificationId: v.id("notifications"),
    deliveryStatus: v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("read")
    ),
    deliveredAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_notification", ["notificationId"])
    .index("by_user_notification", ["userId", "notificationId"])
    .index("by_delivery_status", ["deliveryStatus"])
    .index("by_delivered_time", ["deliveredAt"]),
};

// Create custom user table with additional fields
const customAuthTables = {
  ...authTables,
  users: defineTable({
    // Standard auth fields
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    // Phone auth fields
     phone: v.optional(v.string()),
     phoneVerificationTime: v.optional(v.number()),
     enrollmentId: v.optional(v.string()),
     referralCode: v.optional(v.string()), // Unique referral code (e.g., PLYG001ABC)
    temporaryPassword: v.optional(v.string()),
    password: v.optional(v.string()),
    isTemporaryPassword: v.optional(v.boolean()),
    // Enhanced user tracking
     studentId: v.optional(v.string()), // Unique PLYG123 format ID
     fullName: v.optional(v.string()),
     dateOfBirth: v.optional(v.number()),
     gender: v.optional(v.string()),
     address: v.optional(v.string()),
     city: v.optional(v.string()),
     state: v.optional(v.string()),
     pincode: v.optional(v.string()),
     emergencyContact: v.optional(v.object({
       name: v.string(),
       phone: v.string(),
       relation: v.string(),
     })),
     preferredLocation: v.optional(v.id("locations")),
     userType: v.optional(v.union(v.literal("student"), v.literal("parent"), v.literal("coach"), v.literal("admin"))),
      status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
     totalEnrollments: v.optional(v.number()),
     totalSessions: v.optional(v.number()),
     totalLoginSessions: v.optional(v.number()),
     lastActivity: v.optional(v.number()),
     lastLoginTime: v.optional(v.number()),
     currentSessionId: v.optional(v.string()),
     registrationSource: v.optional(v.union(
       v.literal("self_registration"),
       v.literal("admin_created"),
       v.literal("referral"),
       v.literal("trial_booking")
     )),
     deviceInfo: v.optional(v.object({
       deviceType: v.string(),
       browser: v.string(),
       os: v.string(),
     })),
    createdAt: v.optional(v.number()),
    lastLogin: v.optional(v.number()),
    passwordUpdatedAt: v.optional(v.number()),
    fcmToken: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_phone", ["phone"])
     .index("by_email", ["email"])
     .index("by_student_id", ["studentId"])
     .index("by_referral_code", ["referralCode"])
     .index("by_user_type", ["userType"])
     .index("by_status", ["status"])
     .index("by_city", ["city"])
     .index("by_preferred_location", ["preferredLocation"])
     .index("by_registration_source", ["registrationSource"])
     .index("by_fcm_token", ["fcmToken"]),

  // Referral System Tables
  referralSettings: defineTable({
    packageDuration: v.string(), // "1-month", "3-months", "6-months", "12-months"
    rewardSessions: v.number(), // Number of free sessions to award
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_package", ["packageDuration"])
    .index("by_active", ["isActive"]),

  referrals: defineTable({
    referrerStudentId: v.string(), // Student ID of the person making the referral
    referrerUserId: v.id("users"), // User ID of the referrer
    referredPhone: v.string(), // Phone number of the referred person
    referredUserId: v.optional(v.id("users")), // User ID of referred person (set after signup)
    referralCode: v.string(), // The referral code used (same as referrerStudentId)
    status: v.union(
      v.literal("pending"), // Referral code used but not yet enrolled
      v.literal("completed"), // Referred person completed enrollment
      v.literal("rewarded"), // Referrer has been rewarded
      v.literal("expired") // Referral expired or invalid
    ),
    enrollmentId: v.optional(v.id("userEnrollments")), // Enrollment that triggered the referral
    packageDuration: v.optional(v.string()), // Package duration of the referred enrollment
    rewardSessions: v.optional(v.number()), // Sessions awarded to referrer
    rewardedAt: v.optional(v.number()), // When the reward was given
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_referrer_student_id", ["referrerStudentId"])
    .index("by_referrer_user_id", ["referrerUserId"])
    .index("by_referred_phone", ["referredPhone"])
    .index("by_referred_user_id", ["referredUserId"])
    .index("by_referral_code", ["referralCode"])
    .index("by_status", ["status"])
    .index("by_enrollment_id", ["enrollmentId"]),

  referralRewards: defineTable({
    referralId: v.id("referrals"),
    referrerUserId: v.id("users"),
    referrerStudentId: v.string(),
    rewardType: v.union(
      v.literal("free_sessions"),
      v.literal("discount"),
      v.literal("cash_reward")
    ),
    rewardValue: v.number(), // Number of sessions, discount amount, or cash amount
    rewardStatus: v.union(
      v.literal("pending"),
      v.literal("applied"),
      v.literal("used"),
      v.literal("expired")
    ),
    appliedToEnrollmentId: v.optional(v.id("userEnrollments")),
    expiryDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_referral_id", ["referralId"])
    .index("by_referrer_user_id", ["referrerUserId"])
    .index("by_referrer_student_id", ["referrerStudentId"])
    .index("by_reward_status", ["rewardStatus"])
    .index("by_applied_enrollment", ["appliedToEnrollmentId"]),

  sessionAdjustments: defineTable({
    enrollmentId: v.id("userEnrollments"),
    userId: v.id("users"),
    studentId: v.string(), // Student ID for easy reference
    adjustmentType: v.union(
      v.literal("add_sessions"),
      v.literal("remove_sessions"),
      v.literal("reset_sessions")
    ),
    sessionsAdjusted: v.number(), // Positive for add, negative for remove
    previousSessionsTotal: v.number(),
    newSessionsTotal: v.number(),
    reason: v.string(), // Required reason for the adjustment
    adjustedBy: v.optional(v.id("users")), // Admin who made the adjustment
    adjustedByName: v.string(), // Admin name for audit trail
    notes: v.optional(v.string()), // Additional notes
    createdAt: v.number(),
  }).index("by_enrollment", ["enrollmentId"])
    .index("by_user", ["userId"])
    .index("by_student_id", ["studentId"])
    .index("by_adjusted_by", ["adjustedBy"])
    .index("by_adjustment_type", ["adjustmentType"])
    .index("by_created_at", ["createdAt"]),

  carouselImages: defineTable({
    title: v.optional(v.string()), // Made optional
    imageUrl: v.string(), // Desktop image URL
    mobileImageUrl: v.optional(v.string()), // Optional mobile-specific image
    linkUrl: v.optional(v.string()), // Optional link when image is clicked
    description: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(), // For sorting images
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.id("users")), // Admin who added the image
  }).index("by_active", ["isActive"])
    .index("by_order", ["order"])
    .index("by_created_at", ["createdAt"]),
};

export default defineSchema({
  ...customAuthTables,
  ...applicationTables,
});
