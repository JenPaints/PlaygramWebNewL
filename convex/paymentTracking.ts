import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Unified Payment Tracking Service
// This service ensures ALL payments are consistently tracked

// Types for payment tracking
export const PAYMENT_TYPES = {
  ENROLLMENT: "enrollment" as const,
  MERCHANDISE: "merchandise" as const,
  TRIAL: "trial" as const,
};

export const PAYMENT_STATUSES = {
  PENDING: "pending" as const,
  ATTEMPTED: "attempted" as const,
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
};

// Log payment action with detailed tracking
export const logPaymentAction = mutation({
  args: {
    action: v.string(),
    paymentData: v.any(),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    await ctx.db.insert("payment_logs", {
      action: args.action,
      data: JSON.stringify(args.paymentData),
      error: args.error,
      timestamp,
      createdAt: timestamp,
    });
    
    return { success: true, timestamp };
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    razorpayPaymentId: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Get the payment record
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    // Update the payment record
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      details: {
        ...payment.details,
        razorpayPaymentId: args.razorpayPaymentId,
        razorpayOrderId: args.razorpayOrderId,
      },
      updatedAt: timestamp,
    });
    
    // If it's an enrollment payment, also update the enrollment status
    if (payment.type === "enrollment" && payment.details?.enrollmentId) {
      try {
        await ctx.db.patch(payment.details.enrollmentId as any, {
          paymentStatus: args.status === "completed" ? "paid" : "pending",
          enrollmentStatus: args.status === "completed" ? "active" : "cancelled",
          razorpayPaymentId: args.razorpayPaymentId,
          updatedAt: timestamp,
        });
      } catch (error) {
        console.error("Failed to update enrollment status:", error);
      }
    }
    
    // Log the payment status update
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "payment_status_updated",
      paymentData: {
        paymentId: args.paymentId,
        oldStatus: payment.status,
        newStatus: args.status,
        razorpayPaymentId: args.razorpayPaymentId,
      },
      metadata: { source: "paymentTracking.updatePaymentStatus" },
    });
    
    return { success: true, paymentId: args.paymentId };
  },
});

// Create unified payment record with comprehensive tracking
export const createPaymentRecord = mutation({
  args: {
    type: v.union(v.literal("enrollment"), v.literal("merchandise"), v.literal("trial")),
    userId: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("attempted"), v.literal("completed"), v.literal("failed")),
    details: v.object({
      orderId: v.optional(v.string()),
      paymentId: v.optional(v.string()),
      razorpayOrderId: v.optional(v.string()),
      razorpayPaymentId: v.optional(v.string()),
      enrollmentId: v.optional(v.union(v.id("enrollments"), v.id("userEnrollments"))),
      merchandiseOrderId: v.optional(v.id("merchandiseOrders")),
      sport: v.optional(v.string()),
      planId: v.optional(v.string()),
      sessionStartDate: v.optional(v.number()),
      courtLocation: v.optional(v.string()),
      orderNumber: v.optional(v.string()),
      items: v.optional(v.any()),
    }),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Log payment creation attempt
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "payment_record_creation_start",
      paymentData: {
        type: args.type,
        userId: args.userId,
        amount: args.amount,
        status: args.status,
        orderId: args.details.orderId,
      },
      metadata: args.metadata,
    });

    try {
      const paymentId = await ctx.db.insert("payments", {
        type: args.type,
        userId: args.userId,
        amount: args.amount,
        currency: args.currency || "INR",
        status: args.status,
        details: args.details,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // Log successful creation
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_record_creation_success",
        paymentData: {
          paymentId,
          type: args.type,
          userId: args.userId,
          amount: args.amount,
          status: args.status,
        },
        metadata: args.metadata,
      });

      console.log(`✅ Payment record created: ${paymentId} for ${args.userId}`);
      return { success: true, paymentId, timestamp };

    } catch (error) {
      // Log failure
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_record_creation_failed",
        paymentData: {
          type: args.type,
          userId: args.userId,
          amount: args.amount,
          status: args.status,
        },
        error: error instanceof Error ? error.message : String(error),
        metadata: args.metadata,
      });

      console.error(`❌ Payment record creation failed:`, error);
      throw error;
    }
  },
});

// Update payment record with status and additional details
export const updatePaymentRecord = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.optional(v.union(v.literal("pending"), v.literal("attempted"), v.literal("completed"), v.literal("failed"))),
    details: v.optional(v.object({
        orderId: v.optional(v.string()),
        paymentId: v.optional(v.string()),
        razorpayOrderId: v.optional(v.string()),
        razorpayPaymentId: v.optional(v.string()),
        enrollmentId: v.optional(v.union(v.id("enrollments"), v.id("userEnrollments"))),
        merchandiseOrderId: v.optional(v.id("merchandiseOrders")),
        sport: v.optional(v.string()),
        planId: v.optional(v.string()),
        sessionStartDate: v.optional(v.number()),
        courtLocation: v.optional(v.string()),
        orderNumber: v.optional(v.string()),
        items: v.optional(v.any()),
      })),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Get existing payment record
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Log update attempt
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "payment_record_update_start",
      paymentData: {
        paymentId: args.paymentId,
        oldStatus: payment.status,
        newStatus: args.status,
        userId: payment.userId,
      },
      metadata: args.metadata,
    });

    try {
      const updateData: any = { updatedAt: timestamp };
      
      if (args.status) {
        updateData.status = args.status;
      }
      
      if (args.details) {
        updateData.details = { ...payment.details, ...args.details };
      }

      await ctx.db.patch(args.paymentId, updateData);

      // Log successful update
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_record_update_success",
        paymentData: {
          paymentId: args.paymentId,
          oldStatus: payment.status,
          newStatus: args.status,
          userId: payment.userId,
        },
        metadata: args.metadata,
      });

      console.log(`✅ Payment record updated: ${args.paymentId}`);
      return { success: true, timestamp };

    } catch (error) {
      // Log failure
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_record_update_failed",
        paymentData: {
          paymentId: args.paymentId,
          userId: payment.userId,
        },
        error: error instanceof Error ? error.message : String(error),
        metadata: args.metadata,
      });

      console.error(`❌ Payment record update failed:`, error);
      throw error;
    }
  },
});

// Find payment by various criteria
export const findPaymentRecord = query({
  args: {
    userId: v.optional(v.string()),
    type: v.optional(v.union(v.literal("enrollment"), v.literal("merchandise"), v.literal("trial"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("attempted"), v.literal("completed"), v.literal("failed"))),
    orderId: v.optional(v.string()),
    enrollmentId: v.optional(v.union(v.id("enrollments"), v.id("userEnrollments"))),
    merchandiseOrderId: v.optional(v.id("merchandiseOrders")),
  },
  handler: async (ctx, args) => {
    let payments;
    
    if (args.userId) {
      payments = await ctx.db.query("payments")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      payments = await ctx.db.query("payments").collect();
    }
    
    return payments.filter(payment => {
      if (args.type && payment.type !== args.type) return false;
      if (args.status && payment.status !== args.status) return false;
      if (args.orderId && payment.details?.orderId !== args.orderId) return false;
      if (args.enrollmentId && payment.details?.enrollmentId !== args.enrollmentId) return false;
      if (args.merchandiseOrderId && payment.details?.merchandiseOrderId !== args.merchandiseOrderId) return false;
      return true;
    });
  },
});

// Get all payments with filtering and pagination
export const getAllPaymentRecords = query({
  args: {
    type: v.optional(v.union(v.literal("enrollment"), v.literal("merchandise"), v.literal("trial"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("attempted"), v.literal("completed"), v.literal("failed"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let payments;
    
    if (args.status) {
      payments = await ctx.db.query("payments")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit || 100);
    } else {
      payments = await ctx.db.query("payments")
        .order("desc")
        .take(args.limit || 100);
    }
    
    if (args.type) {
      payments = payments.filter(payment => payment.type === args.type);
    }
    
    // Enrich payments with user information
    // Helper function to normalize phone numbers for lookup
    const normalizePhoneNumber = (phone: string): string[] => {
      if (!phone) return [];
      
      // Remove any spaces, dashes, or other formatting
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      
      // Generate possible formats
      const formats = [];
      
      // If it starts with +91, also try without +91
      if (cleaned.startsWith('+91')) {
        formats.push(cleaned); // +919188817888
        formats.push(cleaned.substring(3)); // 9188817888
      }
      // If it starts with 91 (but not +91), try with +91
      else if (cleaned.startsWith('91') && cleaned.length === 12) {
        formats.push(cleaned); // 919188817888
        formats.push('+' + cleaned); // +919188817888
      }
      // If it's 10 digits, try with +91 and 91 prefix
      else if (cleaned.length === 10) {
        formats.push(cleaned); // 9188817888
        formats.push('91' + cleaned); // 919188817888
        formats.push('+91' + cleaned); // +919188817888
      }
      // Otherwise, just use as-is
      else {
        formats.push(cleaned);
      }
      
      return [...new Set(formats)]; // Remove duplicates
    };

    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        let user = null;
        
        // Try to find user by phone number (userId) with multiple formats
        if (payment.userId) {
          const phoneFormats = normalizePhoneNumber(payment.userId);
          
          // Try each phone format until we find a match
          for (const phoneFormat of phoneFormats) {
            user = await ctx.db
              .query("users")
              .withIndex("by_phone", (q) => q.eq("phone", phoneFormat))
              .first();
            
            if (user) break; // Found a match, stop searching
          }
        }
        
        return {
          ...payment,
          user: user ? {
            fullName: user.fullName || user.name || 'Unknown User',
            phone: user.phone,
            studentId: user.studentId,
          } : null,
        };
      })
    );
    
    return enrichedPayments;
  },
});

// Get payment summary statistics
export const getPaymentSummary = query({
  args: {
    userId: v.optional(v.string()),
    type: v.optional(v.union(v.literal("enrollment"), v.literal("merchandise"), v.literal("trial"))),
  },
  handler: async (ctx, args) => {
    let payments;
    
    if (args.userId) {
      payments = await ctx.db.query("payments")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      payments = await ctx.db.query("payments").collect();
    }
    
    const filteredPayments = args.type 
      ? payments.filter(p => p.type === args.type)
      : payments;
    
    const summary = {
      total: filteredPayments.length,
      pending: filteredPayments.filter(p => p.status === "pending").length,
      attempted: filteredPayments.filter(p => p.status === "attempted").length,
      completed: filteredPayments.filter(p => p.status === "completed").length,
      failed: filteredPayments.filter(p => p.status === "failed").length,
      totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      completedAmount: filteredPayments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    };
    
    return summary;
  },
});

// Get payment logs for debugging
export const getPaymentTrackingLogs = query({
  args: { 
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("payment_logs").withIndex("by_timestamp");
    
    if (args.action) {
      query = query.filter((q) => q.eq(q.field("action"), args.action));
    }
    
    const logs = await query.order("desc").take(args.limit || 100);
    
    return logs.map(log => ({
      ...log,
      data: JSON.parse(log.data),
      formattedTime: new Date(log.timestamp).toLocaleString()
    }));
  },
});

// Emergency payment sync - reconcile missing payments
export const syncMissingPayments = mutation({
  args: {},
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "payment_sync_start",
      paymentData: { timestamp },
    });

    try {
      // Get all enrollments without corresponding payment records (old enrollments table)
      const enrollments = await ctx.db.query("enrollments").collect();
      const payments = await ctx.db.query("payments").collect();
      
      const missingPayments = [];
      
      for (const enrollment of enrollments) {
        const hasPayment = payments.some(p => 
          p.type === "enrollment" && 
          p.details?.enrollmentId === enrollment._id
        );
        
        if (!hasPayment) {
          // Create missing payment record
          const paymentId = await ctx.db.insert("payments", {
            type: "enrollment",
            userId: enrollment.phoneNumber,
            amount: enrollment.paymentAmount || 0,
            currency: "INR",
            status: enrollment.status === "active" ? "completed" : "pending",
            details: {
              enrollmentId: enrollment._id,
              sport: enrollment.sport,
              planId: enrollment.planId,
              orderId: enrollment.orderId,
              paymentId: enrollment.paymentId,
            },
            createdAt: enrollment.createdAt || timestamp,
            updatedAt: timestamp,
          });
          
          missingPayments.push({
            enrollmentId: enrollment._id,
            paymentId,
            phoneNumber: enrollment.phoneNumber,
          });
        }
      }
      
      // CRITICAL: Also check userEnrollments table (new enrollment system)
      const userEnrollments = await ctx.db.query("userEnrollments").collect();
      
      for (const userEnrollment of userEnrollments) {
        const hasPayment = payments.some(p => 
          p.type === "enrollment" && 
          p.details?.enrollmentId === (userEnrollment._id as any)
        );
        
        if (!hasPayment) {
          // Get user info for phone number
          const user = await ctx.db.get(userEnrollment.userId);
          const userPhone = user?.phone || 'unknown';
          
          // Create missing payment record for userEnrollment
          const paymentId = await ctx.db.insert("payments", {
            type: "enrollment",
            userId: userPhone,
            amount: userEnrollment.paymentAmount || 0,
            currency: "INR",
            status: userEnrollment.paymentStatus === "paid" ? "completed" : 
                   userEnrollment.paymentStatus === "failed" ? "failed" : "pending",
            details: {
               enrollmentId: userEnrollment._id as any,
               sport: userEnrollment.packageType, // Use package type as sport info
               planId: userEnrollment.packageDuration,
               orderId: userEnrollment.razorpayOrderId,
               paymentId: userEnrollment.razorpayPaymentId,
             },
            createdAt: userEnrollment.createdAt || timestamp,
            updatedAt: timestamp,
          });
          
          missingPayments.push({
            enrollmentId: userEnrollment._id,
            paymentId,
            phoneNumber: userPhone,
          });
        }
      }

      // Get all merchandise orders without corresponding payment records
      const merchandiseOrders = await ctx.db.query("merchandiseOrders").collect();
      
      for (const order of merchandiseOrders) {
        const hasPayment = payments.some(p => 
          p.type === "merchandise" && 
          p.details?.merchandiseOrderId === order._id
        );
        
        if (!hasPayment) {
          // Create missing payment record
          const paymentId = await ctx.db.insert("payments", {
            type: "merchandise",
            userId: order.customerPhone,
            amount: order.totalAmount,
            currency: "INR",
            status: order.paymentStatus === "paid" ? "completed" : 
                   order.paymentStatus === "failed" ? "failed" : "pending",
            details: {
              merchandiseOrderId: order._id,
              orderNumber: order.orderNumber,
              items: order.items?.map((item: any) => ({
                merchandiseId: item.merchandiseId,
                quantity: item.quantity,
                price: item.price,
              })),
              orderId: order.razorpayOrderId,
              paymentId: order.razorpayPaymentId,
            },
            createdAt: order.createdAt || timestamp,
            updatedAt: timestamp,
          });
          
          missingPayments.push({
            merchandiseOrderId: order._id,
            paymentId,
            customerPhone: order.customerPhone,
          });
        }
      }

      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_sync_success",
        paymentData: { 
          missingPaymentsCreated: missingPayments.length,
          missingPayments 
        },
      });

      return { 
        success: true, 
        missingPaymentsCreated: missingPayments.length,
        details: missingPayments 
      };

    } catch (error) {
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_sync_failed",
        paymentData: { timestamp },
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
});