import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Create a new user enrollment
export const createUserEnrollment = mutation({
  args: {
    userId: v.id("users"),
    batchId: v.id("batches"),
    packageType: v.string(),
    packageDuration: v.string(),
    sessionsTotal: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    paymentAmount: v.number(),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    )),
    enrollmentStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is already enrolled in this batch
    const existingEnrollment = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user_batch", (q) => 
        q.eq("userId", args.userId).eq("batchId", args.batchId)
      )
      .filter((q) => 
        q.or(
          q.eq(q.field("enrollmentStatus"), "active"),
          q.eq(q.field("enrollmentStatus"), "paused")
        )
      )
      .first();
    
    // Check batch capacity
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }
    
    let enrollmentId: Id<"userEnrollments">;
    
    if (existingEnrollment) {
      // User is already enrolled - add sessions from selected package to existing enrollment
      const additionalSessions = args.sessionsTotal;
      const newSessionsTotal = existingEnrollment.sessionsTotal + additionalSessions;
      
      // Calculate new end date (extend by proportional time)
      const currentDuration = existingEnrollment.endDate - existingEnrollment.startDate;
      const sessionRatio = newSessionsTotal / existingEnrollment.sessionsTotal;
      const newEndDate = existingEnrollment.startDate + (currentDuration * sessionRatio);
      
      // Update existing enrollment with additional sessions
       await ctx.db.patch(existingEnrollment._id, {
         sessionsTotal: newSessionsTotal,
         endDate: newEndDate,
         paymentAmount: existingEnrollment.paymentAmount + args.paymentAmount,
         paymentStatus: args.paymentStatus || "pending", // Use provided status or default to pending
         razorpayOrderId: args.razorpayOrderId,
         razorpayPaymentId: args.razorpayPaymentId,
         notes: `${existingEnrollment.notes || ''} | Additional ${additionalSessions} sessions added on ${new Date().toLocaleDateString()}`,
         updatedAt: Date.now(),
       });
       
       // Generate additional session schedules for the new sessions
       try {
         console.log(`🔄 Adding ${additionalSessions} additional sessions to existing enrollment ${existingEnrollment._id}`);
         await ctx.runMutation(internal.sessionSchedules.generateAdditionalSessions, {
           enrollmentId: existingEnrollment._id,
           batchId: args.batchId,
           additionalSessions: additionalSessions,
           startFromDate: Date.now(), // This will be recalculated in generateAdditionalSessions
         });
         console.log(`✅ Successfully added ${additionalSessions} additional sessions`);
       } catch (error) {
         console.error('❌ Failed to generate additional session schedules:', error);
         // Continue with enrollment even if schedule generation fails
       }
       
       enrollmentId = existingEnrollment._id;
    } else {
      // New enrollment - check batch capacity
      if (batch.currentEnrollments >= batch.maxCapacity) {
        throw new Error("Batch is full");
      }
      
      // Create new enrollment
      enrollmentId = await ctx.db.insert("userEnrollments", {
        ...args,
        sessionsAttended: 0,
        paymentStatus: args.paymentStatus || "pending",
        enrollmentStatus: args.enrollmentStatus || "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update batch current enrollments only for new enrollments
      await ctx.db.patch(args.batchId, {
        currentEnrollments: batch.currentEnrollments + 1,
        updatedAt: Date.now(),
      });
    }

    // Generate session schedules for this enrollment
    try {
      await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
        enrollmentId,
        batchId: args.batchId,
        sessionsTotal: args.sessionsTotal,
        startDate: args.startDate,
      });
    } catch (error) {
      console.error('Failed to generate session schedules:', error);
      // Continue with enrollment even if schedule generation fails
    }

    return enrollmentId;
  },
});

// Update enrollment payment status
export const updateEnrollmentPayment = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    razorpayPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enrollmentId, {
      paymentStatus: args.paymentStatus,
      razorpayPaymentId: args.razorpayPaymentId,
      updatedAt: Date.now(),
    });
    
    return args.enrollmentId;
  },
});

// Add additional sessions to existing enrollment
export const addSessionsToEnrollment = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    additionalSessions: v.number(),
    additionalPaymentAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Calculate new totals
    const newSessionsTotal = enrollment.sessionsTotal + args.additionalSessions;
    const newPaymentAmount = enrollment.paymentAmount + args.additionalPaymentAmount;
    
    // Calculate new end date (extend proportionally)
    const currentDuration = enrollment.endDate - enrollment.startDate;
    const sessionRatio = newSessionsTotal / enrollment.sessionsTotal;
    const newEndDate = enrollment.startDate + (currentDuration * sessionRatio);

    // Update enrollment
    await ctx.db.patch(args.enrollmentId, {
      sessionsTotal: newSessionsTotal,
      paymentAmount: newPaymentAmount,
      paymentStatus: args.paymentStatus,
      endDate: newEndDate,
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      notes: `${enrollment.notes || ''} | Additional ${args.additionalSessions} sessions added on ${new Date().toLocaleDateString()}`,
      updatedAt: Date.now(),
    });

    // Generate additional session schedules
    try {
      console.log(`🔄 Adding ${args.additionalSessions} additional sessions to enrollment ${args.enrollmentId}`);
      await ctx.runMutation(internal.sessionSchedules.generateAdditionalSessions, {
        enrollmentId: args.enrollmentId,
        batchId: enrollment.batchId,
        additionalSessions: args.additionalSessions,
        startFromDate: Date.now(),
      });
      console.log(`✅ Successfully added ${args.additionalSessions} additional sessions`);
    } catch (error) {
      console.error('❌ Failed to generate additional session schedules:', error);
      // Continue even if schedule generation fails
    }
    
    return args.enrollmentId;
  },
});

// Update enrollment status
export const updateEnrollmentStatus = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    
    // If cancelling, update batch enrollment count
    if (args.status === "cancelled" && enrollment.enrollmentStatus === "active") {
      const batch = await ctx.db.get(enrollment.batchId);
      if (batch) {
        await ctx.db.patch(enrollment.batchId, {
          currentEnrollments: Math.max(0, batch.currentEnrollments - 1),
          updatedAt: Date.now(),
        });
      }
    }
    
    await ctx.db.patch(args.enrollmentId, {
      enrollmentStatus: args.status,
      notes: args.notes,
      updatedAt: Date.now(),
    });
    
    return args.enrollmentId;
  },
});

// Get user enrollments
export const getUserEnrollments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Populate batch, sport, and location details
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const batch = await ctx.db.get(enrollment.batchId);
        if (!batch) return { ...enrollment, batch: null, sport: null, location: null };
        
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        
        return {
          ...enrollment,
          batch,
          sport,
          location,
        };
      })
    );
    
    return enrollmentsWithDetails;
  },
});

// Get user enrollments by phone
export const getUserEnrollmentsByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    // First find the user by phone
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
    
    if (!user) {
      return [];
    }
    
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    // Populate batch, sport, and location details
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const batch = await ctx.db.get(enrollment.batchId);
        if (!batch) return { ...enrollment, batch: null, sport: null, location: null };
        
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        
        return {
          ...enrollment,
          batch,
          sport,
          location,
        };
      })
    );
    
    return enrollmentsWithDetails;
  },
});

// Get active user enrollments
export const getActiveUserEnrollments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();
    
    // Populate batch, sport, and location details
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const batch = await ctx.db.get(enrollment.batchId);
        if (!batch) return { ...enrollment, batch: null, sport: null, location: null };
        
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        
        return {
          ...enrollment,
          batch,
          sport,
          location,
        };
      })
    );
    
    return enrollmentsWithDetails;
  },
});

// Get batch enrollments
export const getBatchEnrollments = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();
    
    // Populate user details
    const enrollmentsWithUsers = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        return {
          ...enrollment,
          user,
        };
      })
    );
    
    return enrollmentsWithUsers;
  },
});

// Get all enrollments (for admin)
export const getAllEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("userEnrollments").collect();
    
    // Populate user, batch, sport, and location details
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        const batch = await ctx.db.get(enrollment.batchId);
        
        if (!batch) {
          return { ...enrollment, user, batch: null, sport: null, location: null };
        }
        
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        
        return {
          ...enrollment,
          user,
          batch,
          sport,
          location,
        };
      })
    );
    
    return enrollmentsWithDetails;
  },
});

// Update session attendance
export const updateSessionAttendance = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    increment: v.number(), // +1 for attended session, -1 to undo
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    
    const newAttendance = Math.max(0, 
      Math.min(enrollment.sessionsTotal, enrollment.sessionsAttended + args.increment)
    );
    
    // Check if all sessions are completed
    const isCompleted = newAttendance >= enrollment.sessionsTotal;
    const updateData: any = {
      sessionsAttended: newAttendance,
      updatedAt: Date.now(),
    };
    
    // Automatically mark as completed when all sessions are finished
    if (isCompleted && enrollment.enrollmentStatus === 'active') {
      updateData.enrollmentStatus = 'completed';
    }
    
    await ctx.db.patch(args.enrollmentId, updateData);
    
    return newAttendance;
  },
});

// Upgrade enrollment package (add more sessions)
export const upgradeEnrollmentPackage = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    newPackageType: v.string(),
    newPackageDuration: v.string(),
    additionalSessions: v.number(),
    additionalPaymentAmount: v.number(),
    razorpayOrderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Check if enrollment is active
    if (enrollment.enrollmentStatus !== "active") {
      throw new Error("Can only upgrade active enrollments");
    }

    // Calculate new totals
    const newSessionsTotal = enrollment.sessionsTotal + args.additionalSessions;
    const newPaymentAmount = enrollment.paymentAmount + args.additionalPaymentAmount;
    
    // Calculate new end date based on new package duration
    const currentEndDate = new Date(enrollment.endDate);
    let newEndDate = new Date(currentEndDate);
    
    if (args.newPackageDuration.includes('month')) {
      const additionalMonths = parseInt(args.newPackageDuration) - parseInt(enrollment.packageDuration);
      newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);
    } else if (args.newPackageDuration.includes('year')) {
      const additionalYears = parseInt(args.newPackageDuration) - (parseInt(enrollment.packageDuration) / 12);
      newEndDate.setFullYear(newEndDate.getFullYear() + additionalYears);
    }

    // Update enrollment with new package details
    await ctx.db.patch(args.enrollmentId, {
      packageType: args.newPackageType,
      packageDuration: args.newPackageDuration,
      sessionsTotal: newSessionsTotal,
      endDate: newEndDate.getTime(),
      paymentAmount: newPaymentAmount,
      razorpayOrderId: args.razorpayOrderId,
      updatedAt: Date.now(),
    });

    // Generate additional session schedules
      try {
        await ctx.runMutation(internal.sessionSchedules.generateAdditionalSessions, {
          enrollmentId: args.enrollmentId,
          batchId: enrollment.batchId,
          additionalSessions: args.additionalSessions,
          startFromDate: currentEndDate.getTime(),
        });
      } catch (error) {
        console.error('Failed to generate additional session schedules:', error);
        // Continue with upgrade even if schedule generation fails
      }

    return {
      enrollmentId: args.enrollmentId,
      newSessionsTotal,
      newEndDate: newEndDate.getTime(),
      additionalSessions: args.additionalSessions,
    };
  },
});

// Check if enrollment can be upgraded
export const canUpgradeEnrollment = query({
  args: { enrollmentId: v.id("userEnrollments") },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return { canUpgrade: false, reason: "Enrollment not found" };
    }

    // Check if enrollment is active
    if (enrollment.enrollmentStatus !== "active") {
      return { canUpgrade: false, reason: "Only active enrollments can be upgraded" };
    }

    // Check if enrollment is within the same month (for upgrade eligibility)
    const enrollmentDate = new Date(enrollment.createdAt);
    const currentDate = new Date();
    const isSameMonth = enrollmentDate.getMonth() === currentDate.getMonth() && 
                       enrollmentDate.getFullYear() === currentDate.getFullYear();

    if (!isSameMonth) {
      return { canUpgrade: false, reason: "Upgrades only allowed within the same month of enrollment" };
    }

    // Check if payment is completed
    if (enrollment.paymentStatus !== "paid") {
      return { canUpgrade: false, reason: "Original payment must be completed before upgrading" };
    }

    return { 
      canUpgrade: true, 
      currentPackage: enrollment.packageType,
      currentSessions: enrollment.sessionsTotal,
      sessionsAttended: enrollment.sessionsAttended,
      remainingSessions: enrollment.sessionsTotal - enrollment.sessionsAttended
    };
  },
});

// Get enrollment statistics
export const getEnrollmentStatistics = query({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("userEnrollments").collect();
    
    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.enrollmentStatus === "active").length,
      completedEnrollments: enrollments.filter(e => e.enrollmentStatus === "completed").length,
      cancelledEnrollments: enrollments.filter(e => e.enrollmentStatus === "cancelled").length,
      paidEnrollments: enrollments.filter(e => e.paymentStatus === "paid").length,
      totalRevenue: enrollments
        .filter(e => e.paymentStatus === "paid")
        .reduce((sum, e) => sum + e.paymentAmount, 0),
      averageSessionsAttended: enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.sessionsAttended / e.sessionsTotal), 0) / enrollments.length
        : 0,
    };
    
    return stats;
  },
});

// Get enrollment by ID
export const getEnrollmentById = query({
  args: { id: v.id("userEnrollments") },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.id);
    if (!enrollment) return null;
    
    const user = await ctx.db.get(enrollment.userId);
    const batch = await ctx.db.get(enrollment.batchId);
    
    if (!batch) {
      return { ...enrollment, user, batch: null, sport: null, location: null };
    }
    
    const sport = await ctx.db.get(batch.sportId);
    const location = await ctx.db.get(batch.locationId);
    
    return {
      ...enrollment,
      user,
      batch,
      sport,
      location,
    };
  },
});

// Debug function to check all user enrollments
export const debugAllUserEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("userEnrollments").collect();
    const users = await ctx.db.query("users").collect();
    const batches = await ctx.db.query("batches").collect();
    
    return {
      enrollmentsCount: enrollments.length,
      usersCount: users.length,
      batchesCount: batches.length,
      enrollments: enrollments.slice(0, 5), // First 5 enrollments
      users: users.slice(0, 5), // First 5 users
      batches: batches.slice(0, 5), // First 5 batches
    };
  },
});

// Fix enrollment payment statuses for enrollments with payment IDs
export const fixEnrollmentPaymentStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Fixing enrollment payment statuses...');
    
    const enrollments = await ctx.db.query("userEnrollments")
      .filter((q) => q.eq(q.field("paymentStatus"), "pending"))
      .collect();
    
    let fixedCount = 0;
    const fixedEnrollments = [];
    
    for (const enrollment of enrollments) {
      // Check if enrollment has a payment ID in notes (indicating successful payment)
      const hasPaymentId = enrollment.notes && enrollment.notes.includes('Payment ID: pay_');
      const hasRazorpayOrderId = enrollment.razorpayOrderId;
      
      if (hasPaymentId || hasRazorpayOrderId) {
        await ctx.db.patch(enrollment._id, {
          paymentStatus: "paid",
          updatedAt: Date.now(),
        });
        
        fixedCount++;
        fixedEnrollments.push({
          enrollmentId: enrollment._id,
          userId: enrollment.userId,
          razorpayOrderId: enrollment.razorpayOrderId,
          hasPaymentId,
          hasRazorpayOrderId,
        });
        
        console.log(`✅ Fixed enrollment ${enrollment._id} payment status to paid`);
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} enrollment payment statuses`);
    
    return {
      success: true,
      fixedCount,
      totalPendingEnrollments: enrollments.length,
      fixedEnrollments,
    };
  },
});

// Test function to check enrollment creation
export const testEnrollmentCreation = mutation({
  args: {
    userId: v.id("users"),
    batchId: v.id("batches"),
    testData: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('🧪 Testing enrollment creation with args:', args);
    
    try {
      const enrollmentId = await ctx.db.insert("userEnrollments", {
        userId: args.userId,
        batchId: args.batchId,
        packageType: "test",
        packageDuration: "1 month",
        sessionsTotal: 10,
        startDate: Date.now(),
        endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
        paymentAmount: 1,
        razorpayOrderId: "test_order_" + Date.now(),
        notes: `Test enrollment: ${args.testData}`,
        sessionsAttended: 0,
        paymentStatus: "paid",
        enrollmentStatus: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      console.log('✅ Test enrollment created successfully:', enrollmentId);
      return { success: true, enrollmentId };
    } catch (error: any) {
      console.error('❌ Test enrollment creation failed:', error);
      return { success: false, error: error.message };
    }
  },
});