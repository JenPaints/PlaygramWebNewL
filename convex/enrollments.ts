import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create a new enrollment record
export const createEnrollment = mutation({
  args: {
    phoneNumber: v.string(),
    sport: v.union(v.literal("football"), v.literal("basketball"), v.literal("badminton"), v.literal("swimming")),
    planId: v.string(),
    planDuration: v.optional(v.union(v.literal("1-month"), v.literal("3-month"), v.literal("12-month"))),
    razorpayOrderId: v.optional(v.string()),
    paymentAmount: v.optional(v.number()),
    courtLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let enrollmentId;
    try {
      enrollmentId = await ctx.db.insert("enrollments", {
        phoneNumber: args.phoneNumber,
        sport: args.sport,
        planId: args.planId,
        planDuration: args.planDuration,
        status: "pending",
        enrollmentDate: Date.now(),
        orderId: args.razorpayOrderId,
        paymentAmount: args.paymentAmount,
        courtLocation: args.courtLocation,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log(`Enrollment created successfully: ${enrollmentId}`);
    } catch (error) {
      console.error(`Error creating enrollment for user ${args.phoneNumber}:`, error);
      throw new Error('Failed to create enrollment');
    }

    // Insert into unified payments table
    try {
      await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
        type: "enrollment",
        userId: args.phoneNumber,
        amount: args.paymentAmount || 0,
        currency: "INR",
        status: "pending",
        details: {
          enrollmentId,
          sport: args.sport,
          planId: args.planId,
          orderId: args.razorpayOrderId
        },
        metadata: { source: "enrollments.createEnrollment" }
      });
      console.log(`Payment record inserted for enrollment: ${enrollmentId}`);
    } catch (error) {
      console.error(`Error inserting payment for enrollment ${enrollmentId}:`, error);
    }

    // Update user's total enrollment count
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
        .first();
      
      if (user) {
        await ctx.db.patch(user._id, {
          totalEnrollments: (user.totalEnrollments || 0) + 1,
          updatedAt: Date.now(),
        });
        console.log(`Updated enrollment count for user: ${args.phoneNumber}`);
      }
    } catch (error) {
      console.error(`Error updating user enrollment count for ${args.phoneNumber}:`, error);
    }

    return enrollmentId;
  },
});

// Update enrollment with payment information
export const updateEnrollmentPayment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    paymentId: v.string(),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("cancelled")),
    sessionStartDate: v.optional(v.number()),
    courtLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      paymentId: args.paymentId,
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.sessionStartDate) {
      updates.sessionStartDate = args.sessionStartDate;
    }
    if (args.courtLocation) {
      updates.courtLocation = args.courtLocation;
    }

    try {
      await ctx.db.patch(args.enrollmentId, updates);
      console.log(`Enrollment payment updated for ${args.enrollmentId}`);
    } catch (error) {
      console.error(`Error updating enrollment payment for ${args.enrollmentId}:`, error);
      throw new Error('Failed to update enrollment payment');
    }

    // Update payments table
    try {
      const enrollment = await ctx.db.get(args.enrollmentId);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_user", (q) => q.eq("userId", enrollment.phoneNumber))
        .filter((q) => q.eq(q.field("details.enrollmentId"), args.enrollmentId))
        .first();

      if (payment) {
        await ctx.runMutation(api.paymentTracking.updatePaymentRecord, {
          paymentId: payment._id,
          status: args.status === "active" ? "completed" : args.status === "cancelled" ? "failed" : "pending",
          details: {
            paymentId: args.paymentId,
            sessionStartDate: args.sessionStartDate,
            courtLocation: args.courtLocation
          },
          metadata: { source: "enrollments.updateEnrollmentPayment" }
        });
        console.log(`Payment status updated for enrollment ${args.enrollmentId}`);
      }
    } catch (error) {
      console.error(`Error updating payment status for enrollment ${args.enrollmentId}:`, error);
    }

    return { success: true };
  },
});

// Get enrollment by ID
export const getEnrollment = query({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.enrollmentId);
  },
});

// Get enrollments by phone number
export const getEnrollmentsByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();
  },
});

// Get enrollment by payment ID
export const getEnrollmentByPayment = query({
  args: { paymentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
      .first();
  },
});

// Update enrollment status
export const updateEnrollmentStatus = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enrollmentId, {
      status: args.status,
    });

    return { success: true };
  },
});

// Get all active enrollments (for admin purposes)
export const getActiveEnrollments = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Get comprehensive user payment and enrollment data
export const getUserPaymentSummary = query({
  args: { phoneNumber: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let enrollments;

    if (args.phoneNumber !== undefined) {
      const phoneNumber = args.phoneNumber as string;
      enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
        .collect();
    } else {
      enrollments = await ctx.db.query("enrollments").collect();
    }

    // Get payment records for each enrollment
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        let paymentRecord = null;
        if (enrollment.paymentId) {
          paymentRecord = await ctx.db
            .query("payment_orders")
            .withIndex("by_phone", (q) => q.eq("userPhone", enrollment.phoneNumber))
            .first();
        }

        return {
          phoneNumber: enrollment.phoneNumber,
          sport: enrollment.sport,
          planId: enrollment.planId,
          planDuration: enrollment.planDuration,
          courtLocation: enrollment.courtLocation || "Not specified",
          paymentAmount: paymentRecord?.amount || "Not available",
          paymentStatus: enrollment.status,
          enrollmentDate: new Date(enrollment.enrollmentDate).toLocaleDateString(),
          sessionStartDate: enrollment.sessionStartDate
            ? new Date(enrollment.sessionStartDate).toLocaleDateString()
            : "Not scheduled",
          orderId: enrollment.orderId,
          paymentId: enrollment.paymentId,
        };
      })
    );

    return enrichedEnrollments;
  },
});

// Test function to create a sample enrollment
export const createTestEnrollment = mutation({
  args: {
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phoneNumber = args.phoneNumber || "+919980008952";
    console.log('🧪 Creating test enrollment for:', phoneNumber);
    
    try {
      // Create test enrollment
       const enrollmentId = await ctx.db.insert("enrollments", {
         phoneNumber: phoneNumber,
         sport: "football",
         planId: "1-month",
         planDuration: "1-month",
         status: "active",
         enrollmentDate: Date.now(),
         paymentAmount: 1500,
         courtLocation: "Test Football Ground",
         paymentId: "test_pay_" + Date.now(),
         orderId: "test_order_" + Date.now(),
         sessionStartDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // Start in 1 week
         createdAt: Date.now(),
         updatedAt: Date.now(),
       });
      
      console.log('✅ Test enrollment created:', enrollmentId);
      
      return {
        success: true,
        enrollmentId,
        phoneNumber: phoneNumber,
        message: "Test enrollment created successfully"
      };
      
    } catch (error: any) {
      console.error('❌ Error creating test enrollment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
});