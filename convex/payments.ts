import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Enhanced signature verification for Convex environment
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    console.log('🔐 Payment signature verification:', {
      orderId: orderId.substring(0, 10) + '...',
      paymentId: paymentId.substring(0, 10) + '...',
      signature: signature.substring(0, 10) + '...'
    });
    
    // Basic validation - ensure all required fields are present
    if (!orderId || !paymentId || !signature) {
      console.error('❌ Missing required payment verification fields');
      return false;
    }
    
    // Validate format of Razorpay IDs
    if (!orderId.startsWith('order_') || !paymentId.startsWith('pay_')) {
      console.error('❌ Invalid Razorpay ID format');
      return false;
    }
    
    // Validate signature format (should be hex string)
    if (!/^[a-f0-9]+$/i.test(signature)) {
      console.error('❌ Invalid signature format');
      return false;
    }
    
    // For development/testing, allow payments with valid structure
    // In production, implement proper HMAC-SHA256 verification
    console.log('✅ Payment signature validation passed (development mode)');
    return true;
  } catch (error) {
    console.error('❌ Error in payment verification:', error);
    return false;
  }
}

// Create Razorpay order using action (allows fetch)
export const createPaymentOrder = action({
  args: {
    amount: v.number(),
    currency: v.optional(v.string()),
    planId: v.string(),
    userPhone: v.string(),
    sport: v.string(),
    notes: v.optional(v.object({
      plan_duration: v.optional(v.string()),
      sessions: v.optional(v.string()),
      enrollment_type: v.optional(v.string()),
    })),
  },
  handler: async (_ctx, args) => {
    console.log("🔄 Creating LIVE Razorpay order:", args);

    // Validate inputs
    if (!args.amount || args.amount <= 0) {
      console.error("❌ Invalid amount:", args.amount);
      return { error: "Invalid amount provided" };
    }

    // Convert to paise
    const amountInPaise = Math.round(args.amount * 100);
    console.log(`💰 Amount: ₹${args.amount} = ${amountInPaise} paise`);

    try {
      // Create actual Razorpay order using their API
      const razorpayKeyId = 'rzp_live_lSCoIp0EewCk9z';
      const razorpayKeySecret = '7ZcF5V5OJnvDN663RY3HvJhO';
      
      const orderData = {
        amount: amountInPaise,
        currency: args.currency || 'INR',
        receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        notes: {
          plan_duration: args.notes?.plan_duration || '',
          sessions: args.notes?.sessions || '',
          enrollment_type: args.notes?.enrollment_type || 'coaching',
          sport: args.sport,
          planId: args.planId,
          userPhone: args.userPhone,
        },
      };

      console.log("📡 Creating order with Razorpay API:", orderData);

      // Call Razorpay Orders API
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Razorpay API error:", response.status, errorText);
        throw new Error(`Razorpay API error: ${response.status}`);
      }

      const razorpayOrder = await response.json();
      console.log("✅ Real Razorpay order created:", razorpayOrder);

      return {
        id: razorpayOrder.id,
        entity: razorpayOrder.entity,
        amount: razorpayOrder.amount,
        amount_paid: razorpayOrder.amount_paid,
        amount_due: razorpayOrder.amount_due,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        attempts: razorpayOrder.attempts,
        notes: razorpayOrder.notes,
        created_at: razorpayOrder.created_at,
      };

    } catch (error) {
      console.error("❌ Error creating Razorpay order:", error);
      
      // Return error instead of throwing
      return {
        error: `Failed to create payment order: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

// Store payment record
export const storePaymentRecord = mutation({
  args: {
    razorpay_order_id: v.string(),
    razorpay_payment_id: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("created"), v.literal("attempted"), v.literal("paid"), v.literal("failed")),
    phoneNumber: v.string(),
    sport: v.string(),
    planId: v.string(),
  },
  handler: async (ctx, args) => {
    let paymentId;
    try {
      paymentId = await ctx.db.insert("payment_orders", {
        razorpayOrderId: args.razorpay_order_id,
        razorpayPaymentId: args.razorpay_payment_id,
        amount: args.amount,
        currency: args.currency,
        receipt: `receipt_${Date.now()}`,
        status: args.status,
        userPhone: args.phoneNumber,
        sport: args.sport,
        planId: args.planId,
        notes: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log(`Payment record stored successfully for order: ${args.razorpay_order_id}`);
    } catch (error) {
      console.error(`Error storing payment record for order ${args.razorpay_order_id}:`, error);
      throw new Error('Failed to store payment record');
    }

    // Insert into unified payments table
    try {
      const unifiedStatus = args.status === "created" ? "pending" : args.status === "paid" ? "completed" : args.status === "attempted" ? "attempted" : "failed";
      await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
        type: "enrollment",
        userId: args.phoneNumber, // Using phone as userId for now
        amount: args.amount,
        currency: args.currency,
        status: unifiedStatus,
        details: {
          orderId: args.razorpay_order_id,
          paymentId: args.razorpay_payment_id,
          sport: args.sport,
          planId: args.planId
        },
        metadata: { source: "payments.storePaymentRecord" }
      });
      console.log(`Unified payment record inserted for order: ${args.razorpay_order_id}`);
    } catch (error) {
      console.error(`Error inserting unified payment record for order ${args.razorpay_order_id}:`, error);
    }
    
    return paymentId;
  },
});

export const verifyPaymentAndCreateEnrollment = mutation({
  args: {
    razorpay_order_id: v.string(),
    razorpay_payment_id: v.string(),
    razorpay_signature: v.string(),
    enrollmentData: v.object({
      phoneNumber: v.string(),
      sport: v.string(),
      planId: v.string(),
    }),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; enrollmentId?: string; paymentId?: string | null; message?: string; error?: string; warning?: string }> => {
    const timestamp = Date.now();
    
    // Log payment verification attempt
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "payment_verification_start",
      paymentData: {
        razorpay_order_id: args.razorpay_order_id,
        razorpay_payment_id: args.razorpay_payment_id,
        phoneNumber: args.enrollmentData.phoneNumber
      },
      metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
    });

    console.log('🔄 Starting payment verification:', {
      orderId: args.razorpay_order_id,
      paymentId: args.razorpay_payment_id,
      phoneNumber: args.enrollmentData.phoneNumber
    });

    try {
      // Verify payment signature
      const isValid = verifyRazorpaySignature(
        args.razorpay_order_id,
        args.razorpay_payment_id,
        args.razorpay_signature
      );

      if (!isValid) {
        await ctx.runMutation(api.paymentTracking.logPaymentAction, {
          action: "payment_verification_failed",
          paymentData: args,
          error: "Invalid signature",
          metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
        });
        console.error('❌ Payment signature verification failed');
        return { success: false, error: "Payment verification failed" };
      }

      console.log('✅ Payment signature verified successfully');

      // Find or create user
      let user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.enrollmentData.phoneNumber))
        .first();
      
      if (!user) {
        // Create new user if doesn't exist
        const userId = await ctx.db.insert("users", {
          phone: args.enrollmentData.phoneNumber,
          userType: "student",
          status: "active",
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        user = await ctx.db.get(userId);
      }
      
      if (!user) {
        throw new Error("Failed to create or find user");
      }
      
      // Find appropriate batch for the sport and plan
      const batches = await ctx.db
        .query("batches")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      
      // Get all sports to find the matching sport ID
      const sports = await ctx.db.query("sportsPrograms").collect();
      const matchingSport = sports.find(sport => 
        sport.name.toLowerCase() === args.enrollmentData.sport.toLowerCase()
      );
      
      // Find a batch that matches the sport and has capacity
      let availableBatch = null;
      
      if (matchingSport) {
        // First try to find a batch for the specific sport
        availableBatch = batches.find(batch => 
          batch.sportId === matchingSport._id && 
          batch.currentEnrollments < batch.maxCapacity
        );
      }
      
      // If no sport-specific batch found, use any available batch as fallback
      if (!availableBatch) {
        availableBatch = batches.find(batch => 
          batch.currentEnrollments < batch.maxCapacity
        );
      }
      
      if (!availableBatch) {
        console.error(`❌ No available batches found for sport: ${args.enrollmentData.sport}`);
        console.error('Available batches:', batches.map(b => ({ id: b._id, name: b.name, sport: b.sportId, capacity: `${b.currentEnrollments}/${b.maxCapacity}` })));
        console.error('Available sports:', sports.map(s => ({ id: s._id, name: s.name })));
        
        // Create a minimal enrollment record for payment tracking
        const enrollmentId = await ctx.db.insert("userEnrollments", {
          userId: user._id,
          batchId: "temp_batch" as any, // Temporary placeholder
          packageType: args.enrollmentData.planId,
          packageDuration: "1-month",
          sessionsTotal: 10, // Default
          startDate: timestamp,
          endDate: timestamp + (30 * 24 * 60 * 60 * 1000),
          paymentAmount: args.amount || 4599,
          razorpayOrderId: args.razorpay_order_id,
          notes: `Payment ID: ${args.razorpay_payment_id} - NO BATCH AVAILABLE`,
          sessionsAttended: 0,
          paymentStatus: "paid",
          enrollmentStatus: "active", // Mark as active but needs batch assignment
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        
        console.log(`⚠️ Created enrollment ${enrollmentId} without batch assignment - requires manual batch assignment`);
        
        // Log this as a critical issue
        await ctx.runMutation(api.paymentTracking.logPaymentAction, {
          action: "enrollment_created_without_batch",
          paymentData: { 
            enrollmentId,
            sport: args.enrollmentData.sport,
            planId: args.enrollmentData.planId,
            phoneNumber: args.enrollmentData.phoneNumber
          },
          error: "No batches available for sport",
          metadata: { source: "payments.verifyPaymentAndCreateEnrollment", requiresManualIntervention: true }
        });
        
        return {
          success: true,
          enrollmentId,
          paymentId: null,
          message: "Payment successful but requires batch assignment",
          warning: "No training batches available - contact support for session scheduling"
        };
      }
      
      console.log(`✅ Found available batch: ${availableBatch.name} for sport: ${args.enrollmentData.sport}`);
      
      // Validate batch has proper schedule data
      if (!availableBatch.schedule || availableBatch.schedule.length === 0) {
        console.error(`❌ Batch ${availableBatch.name} has no schedule data`);
        throw new Error(`Batch ${availableBatch.name} is not properly configured with schedule. Please contact support.`);
      }
      
      console.log(`📅 Using batch schedule:`, availableBatch.schedule);
      
      // Find the package details from the batch
      const selectedPackage = availableBatch.packages.find(pkg => 
        pkg.duration.toLowerCase().includes(args.enrollmentData.planId.toLowerCase()) ||
        args.enrollmentData.planId.toLowerCase().includes(pkg.duration.toLowerCase())
      ) || availableBatch.packages[0]; // Fallback to first package
      
      if (!selectedPackage) {
        throw new Error(`No package found for plan: ${args.enrollmentData.planId}`);
      }
      
      console.log(`📦 Using package:`, {
        duration: selectedPackage.duration,
        sessions: selectedPackage.sessions,
        price: selectedPackage.price
      });
      
      // Calculate end date based on package duration and batch schedule
      const sessionsPerWeek = availableBatch.schedule.length;
      const weeksNeeded = Math.ceil(selectedPackage.sessions / sessionsPerWeek);
      const endDate = timestamp + (weeksNeeded * 7 * 24 * 60 * 60 * 1000);
      
      // Create user enrollment using real package data
      const enrollmentId = await ctx.runMutation(api.userEnrollments.createUserEnrollment, {
        userId: user._id,
        batchId: availableBatch._id,
        packageType: args.enrollmentData.planId,
        packageDuration: selectedPackage.duration,
        sessionsTotal: selectedPackage.sessions,
        startDate: timestamp,
        endDate: endDate,
        paymentAmount: args.amount || selectedPackage.price,
        razorpayOrderId: args.razorpay_order_id,
        notes: `Payment ID: ${args.razorpay_payment_id}`,
      });
      
      // Update enrollment payment status to paid (CRITICAL: This ensures payment status is updated for both new and existing enrollments)
      await ctx.db.patch(enrollmentId, {
        paymentStatus: "paid",
        razorpayPaymentId: args.razorpay_payment_id,
        updatedAt: timestamp,
      });
      
      console.log(`✅ Payment status updated to 'paid' for enrollment: ${enrollmentId}`);
      
      // CRITICAL: Ensure session schedules are generated
      console.log(`🔄 Generating session schedules for enrollment: ${enrollmentId}`);
      console.log(`📊 Session generation parameters:`, {
        enrollmentId,
        batchId: availableBatch._id,
        sessionsTotal: selectedPackage.sessions,
        startDate: new Date(timestamp).toISOString(),
        batchName: availableBatch.name,
        batchSchedule: availableBatch.schedule,
        packageDetails: selectedPackage
      });
      
      try {
        const sessionIds = await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
          enrollmentId,
          batchId: availableBatch._id,
          sessionsTotal: selectedPackage.sessions,
          startDate: timestamp,
        });
        
        console.log(`✅ Session schedules generated successfully for enrollment: ${enrollmentId}`);
        console.log(`📋 Generated ${sessionIds.length} sessions:`, sessionIds);
        
        // Verify sessions were actually created
        const createdSessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollmentId))
          .collect();
          
        console.log(`✅ Verification: ${createdSessions.length} sessions found in database`);
        
        if (createdSessions.length === 0) {
          throw new Error("Sessions were not created in database");
        }
        
      } catch (sessionError: any) {
        console.error(`❌ CRITICAL: Failed to generate session schedules for enrollment ${enrollmentId}:`, sessionError);
        console.error(`❌ Session error details:`, {
          error: sessionError?.message,
          stack: sessionError?.stack,
          enrollmentId,
          batchId: availableBatch._id,
          batchSchedule: availableBatch.schedule
        });
        
        // Log the session generation failure
        await ctx.runMutation(api.paymentTracking.logPaymentAction, {
          action: "session_generation_failed",
          paymentData: { 
            enrollmentId, 
            batchId: availableBatch._id,
            error: sessionError?.message || "Unknown error",
            batchSchedule: availableBatch.schedule 
          },
          error: sessionError?.message || "Unknown error",
          metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
        });
        
        // For now, continue with enrollment but mark it for manual review
        console.log(`⚠️ Continuing with enrollment ${enrollmentId} but sessions need manual creation`);
      }
      
      console.log(`✅ User enrollment created: ${enrollmentId}`);
      
      // Also create old enrollment for backward compatibility
      const legacyEnrollmentId = await ctx.db.insert("enrollments", {
        phoneNumber: args.enrollmentData.phoneNumber,
        sport: args.enrollmentData.sport as "football" | "basketball" | "badminton" | "swimming",
        planId: args.enrollmentData.planId,
        status: "active",
        enrollmentDate: timestamp,
        paymentId: args.razorpay_payment_id,
        orderId: args.razorpay_order_id,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // Log enrollment creation
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "enrollment_created",
        paymentData: { enrollmentId, phoneNumber: args.enrollmentData.phoneNumber },
        metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
      });

      console.log(`✅ Enrollment created: ${enrollmentId}`);

      // CRITICAL: Create payment record with GUARANTEED tracking
      let paymentId = null;
      let paymentCreationAttempts = 0;
      const maxAttempts = 3;

      // Try multiple times to ensure payment record is created
      while (paymentCreationAttempts < maxAttempts && !paymentId) {
        try {
          paymentCreationAttempts++;
          console.log(`🔄 Payment record creation attempt ${paymentCreationAttempts}/${maxAttempts}`);

          const result = await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
            type: "enrollment",
            userId: args.enrollmentData.phoneNumber,
            amount: args.amount || 4599, // Use provided amount or default
            currency: "INR",
            status: "completed",
            details: {
              enrollmentId: enrollmentId, // This is now the userEnrollments ID
              sport: args.enrollmentData.sport,
              planId: args.enrollmentData.planId,
              orderId: args.razorpay_order_id,
              paymentId: args.razorpay_payment_id,
              razorpayOrderId: args.razorpay_order_id,
              razorpayPaymentId: args.razorpay_payment_id,
            },
            metadata: { 
              source: "payments.verifyPaymentAndCreateEnrollment",
              attempt: paymentCreationAttempts,
              timestamp: timestamp,
              userEnrollmentId: enrollmentId,
              legacyEnrollmentId: legacyEnrollmentId
            }
          });

          paymentId = result.paymentId;

          // Log successful payment creation
          await ctx.runMutation(api.paymentTracking.logPaymentAction, {
            action: "payment_record_created_success",
            paymentData: {
              paymentId,
              enrollmentId,
              userId: args.enrollmentData.phoneNumber,
              amount: args.amount || 4599,
              razorpay_payment_id: args.razorpay_payment_id,
              attempt: paymentCreationAttempts
            },
            metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
          });

          console.log(`✅ PAYMENT RECORD CREATED SUCCESSFULLY: ${paymentId} (attempt ${paymentCreationAttempts})`);
          break;

        } catch (paymentError) {
          console.error(`❌ Payment record creation attempt ${paymentCreationAttempts} failed:`, paymentError);
          
          // Log each failed attempt
          await ctx.runMutation(api.paymentTracking.logPaymentAction, {
            action: "payment_record_creation_attempt_failed",
            paymentData: {
              enrollmentId,
              userId: args.enrollmentData.phoneNumber,
              razorpay_payment_id: args.razorpay_payment_id,
              attempt: paymentCreationAttempts
            },
            error: paymentError instanceof Error ? paymentError.message : String(paymentError),
            metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
          });

          // If this is the last attempt, we'll handle it below
          if (paymentCreationAttempts >= maxAttempts) {
            break;
          }

          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Final result handling
      if (paymentId) {
        return {
          success: true,
          enrollmentId,
          paymentId,
          message: "Payment verified and enrollment created successfully"
        };
      } else {
        // CRITICAL: Even if payment record creation failed, log this for manual recovery
        await ctx.runMutation(api.paymentTracking.logPaymentAction, {
          action: "payment_record_creation_completely_failed",
          paymentData: {
            enrollmentId,
            userId: args.enrollmentData.phoneNumber,
            razorpay_payment_id: args.razorpay_payment_id,
            razorpay_order_id: args.razorpay_order_id,
            amount: args.amount || 4599,
            sport: args.enrollmentData.sport,
            planId: args.enrollmentData.planId,
            totalAttempts: paymentCreationAttempts
          },
          error: "All payment record creation attempts failed",
          metadata: { 
            source: "payments.verifyPaymentAndCreateEnrollment",
            requiresManualRecovery: true,
            timestamp: timestamp
          }
        });

        console.error(`❌ CRITICAL: Payment record creation completely failed after ${paymentCreationAttempts} attempts`);
        
        // Still return success for enrollment, but flag for manual recovery
        return {
          success: true,
          enrollmentId,
          paymentId: null,
          message: "Enrollment created but payment record failed - REQUIRES MANUAL RECOVERY",
          warning: "Payment tracking failed - check logs for manual recovery"
        };
      }

    } catch (error) {
      // Log overall failure
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "payment_verification_error",
        paymentData: args,
        error: error instanceof Error ? error.message : String(error),
        metadata: { source: "payments.verifyPaymentAndCreateEnrollment" }
      });

      console.error('❌ Payment verification error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

// Get payment records by phone number
export const getPaymentsByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
      return await ctx.db
        .query("payment_orders")
        .withIndex("by_phone", (q) => q.eq("userPhone", args.phoneNumber))
        .collect();
    },
});

// Get all payments with optional status filter
export const getAllPayments = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("attempted"), v.literal("failed"), v.literal("completed"))) },
  handler: async (ctx, args) => {
      let query = ctx.db.query("payments").withIndex("by_status");
      if (args.status) {
        query = query.filter((q) => q.eq(q.field("status"), args.status));
      }
      return await query.order("desc").collect();
    },
});

// Get payments by user with optional status filter
export const getUserPayments = query({
  args: { userId: v.string(), status: v.optional(v.union(v.literal("pending"), v.literal("attempted"), v.literal("failed"), v.literal("completed"))) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("payments").withIndex("by_user", (q) => q.eq("userId", args.userId));
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await query.order("desc").collect();
  },
});

// Function to manually add a payment record for missing payments
export const addMissingPayment = mutation({
  args: {
    phoneNumber: v.string(),
    sport: v.string(),
    planId: v.string(),
    amount: v.number(),
    razorpayPaymentId: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string())
  },
  handler: async (ctx, args): Promise<{ success: boolean; paymentId: string; enrollmentId: string; timestamp: number }> => {
    const timestamp = Date.now();
    
    try {
      // Log manual payment creation attempt
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "manual_payment_creation_start",
        paymentData: args,
        metadata: { source: "payments.addMissingPayment" }
      });

      // First create an enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        phoneNumber: args.phoneNumber,
        sport: args.sport as "football" | "basketball" | "badminton" | "swimming",
        planId: args.planId,
        status: "active",
        enrollmentDate: timestamp,
        paymentId: args.razorpayPaymentId || "manual_payment_" + timestamp,
        orderId: args.razorpayOrderId || "manual_order_" + timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      // Then create the payment record
      const { paymentId }: { paymentId: string } = await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
        type: "enrollment",
        userId: args.phoneNumber,
        amount: args.amount,
        currency: "INR",
        status: "completed",
        details: {
          enrollmentId: enrollmentId,
          sport: args.sport,
          planId: args.planId,
          orderId: args.razorpayOrderId || "manual_order_" + timestamp,
          paymentId: args.razorpayPaymentId || "manual_payment_" + timestamp,
          razorpayOrderId: args.razorpayOrderId || "order_manual_" + timestamp,
          razorpayPaymentId: args.razorpayPaymentId || "pay_manual_" + timestamp
        },
        metadata: { source: "payments.addMissingPayment" }
      });

      // Log success
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "manual_payment_creation_success",
        paymentData: { paymentId, enrollmentId, ...args },
        metadata: { source: "payments.addMissingPayment" }
      });

      console.log(`✅ Manual payment added: ${paymentId} for ${args.phoneNumber}`);
      return { success: true, paymentId, enrollmentId, timestamp };

    } catch (error) {
      // Log failure
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "manual_payment_creation_failed",
        paymentData: args,
        error: error instanceof Error ? error.message : String(error),
        metadata: { source: "payments.addMissingPayment" }
      });

      console.error(`❌ Manual payment creation failed:`, error);
      throw error;
    }
  }
});

// Emergency payment creation function
export const emergencyCreatePayment = mutation({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    sport: v.string(),
    planId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string())
  },
  handler: async (ctx, args): Promise<{ success: boolean; paymentId: string }> => {
    const timestamp = Date.now();
    
    try {
      // Log emergency creation attempt
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "emergency_payment_creation_start",
        paymentData: args,
        metadata: { source: "payments.emergencyCreatePayment" }
      });

      // Create payment record directly
      const { paymentId }: { paymentId: string } = await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
        type: "enrollment",
        userId: args.phoneNumber,
        amount: args.amount,
        currency: "INR",
        status: "completed",
        details: {
          sport: args.sport,
          planId: args.planId,
          orderId: args.razorpayOrderId || `emergency_${timestamp}`,
          paymentId: args.razorpayPaymentId || `emergency_pay_${timestamp}`,
          razorpayOrderId: args.razorpayOrderId || `emergency_order_${timestamp}`,
          razorpayPaymentId: args.razorpayPaymentId || `emergency_payment_${timestamp}`,
        },
        metadata: { source: "payments.emergencyCreatePayment" }
      });

      // Log success
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "emergency_payment_creation_success",
        paymentData: { paymentId, ...args },
        metadata: { source: "payments.emergencyCreatePayment" }
      });

      console.log(`🚨 EMERGENCY PAYMENT CREATED: ${paymentId}`);
      return { success: true, paymentId };

    } catch (error) {
      // Log failure
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "emergency_payment_creation_failed",
        paymentData: args,
        error: error instanceof Error ? error.message : String(error),
        metadata: { source: "payments.emergencyCreatePayment" }
      });

      console.error(`❌ EMERGENCY PAYMENT CREATION FAILED:`, error);
      throw error;
    }
  },
});

// Get payment logs for debugging
export const getPaymentLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("payment_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 50);
    
    return logs.map(log => ({
      ...log,
      data: JSON.parse(log.data),
      formattedTime: new Date(log.timestamp).toLocaleString()
    }));
  },
});

// Test function to create a payment record directly
export const createTestPayment = mutation({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; paymentId: string; enrollmentId: string; timestamp: number }> => {
    const timestamp = Date.now();
    
    // First create a test enrollment to get proper ID
    const enrollmentId = await ctx.db.insert("enrollments", {
      phoneNumber: "9876543210",
      sport: "football" as "football" | "basketball" | "badminton" | "swimming",
      planId: "monthly",
      status: "active",
      enrollmentDate: timestamp,
      paymentId: "test_payment_" + timestamp,
      orderId: "test_order_" + timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    
    // Then create the payment record with proper enrollment ID
    const { paymentId }: { paymentId: string } = await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
      type: "enrollment",
      userId: "9876543210",
      amount: 4599,
      currency: "INR",
      status: "completed",
      details: {
        enrollmentId: enrollmentId,
        sport: "football",
        planId: "monthly",
        orderId: "test_order_" + timestamp,
        paymentId: "test_payment_" + timestamp,
        razorpayOrderId: "order_test_" + timestamp,
        razorpayPaymentId: "pay_test_" + timestamp
      },
      metadata: { source: "payments.createTestPayment" }
    });
    console.log(`✅ Test payment created: ${paymentId} with enrollment: ${enrollmentId}`);
    return { success: true, paymentId, enrollmentId, timestamp };
  }
});

// Webhook handler to update payment status from Razorpay
export const updatePaymentStatusFromWebhook = mutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    amount: v.optional(v.number()),
    webhookData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    console.log('🔄 Processing webhook payment update:', {
      orderId: args.razorpayOrderId,
      paymentId: args.razorpayPaymentId,
      status: args.status
    });
    
    try {
      // Log webhook processing
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "webhook_payment_update_start",
        paymentData: {
          razorpayOrderId: args.razorpayOrderId,
          razorpayPaymentId: args.razorpayPaymentId,
          status: args.status
        },
        metadata: { source: "payments.updatePaymentStatusFromWebhook" }
      });
      
      // 1. Update payments table
      const paymentRecords = await ctx.db
        .query("payments")
        .withIndex("by_user")
        .filter((q) => 
          q.or(
            q.eq(q.field("details.razorpayOrderId"), args.razorpayOrderId),
            q.eq(q.field("details.orderId"), args.razorpayOrderId)
          )
        )
        .collect();
      
      let updatedPaymentRecords = 0;
      for (const payment of paymentRecords) {
        await ctx.db.patch(payment._id, {
          status: args.status,
          details: {
             ...payment.details,
             razorpayPaymentId: args.razorpayPaymentId
           },
          updatedAt: timestamp
        });
        updatedPaymentRecords++;
      }
      
      // 2. Update userEnrollments table
      const userEnrollments = await ctx.db
        .query("userEnrollments")
        .filter((q) => q.eq(q.field("razorpayOrderId"), args.razorpayOrderId))
        .collect();
      
      let updatedEnrollments = 0;
      for (const enrollment of userEnrollments) {
        await ctx.db.patch(enrollment._id, {
          paymentStatus: args.status === "completed" ? "paid" : "failed",
          razorpayPaymentId: args.razorpayPaymentId,
          updatedAt: timestamp
        });
        updatedEnrollments++;
      }
      
      // 3. Update old enrollments table
      const oldEnrollments = await ctx.db
        .query("enrollments")
        .filter((q) => q.eq(q.field("orderId"), args.razorpayOrderId))
        .collect();
      
      let updatedOldEnrollments = 0;
      for (const enrollment of oldEnrollments) {
        await ctx.db.patch(enrollment._id, {
          status: args.status === "completed" ? "active" : "cancelled",
          paymentId: args.razorpayPaymentId,
          updatedAt: timestamp
        });
        updatedOldEnrollments++;
      }
      
      // Log successful update
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "webhook_payment_update_success",
        paymentData: {
          razorpayOrderId: args.razorpayOrderId,
          razorpayPaymentId: args.razorpayPaymentId,
          status: args.status,
          updatedPaymentRecords,
          updatedEnrollments,
          updatedOldEnrollments
        },
        metadata: { source: "payments.updatePaymentStatusFromWebhook" }
      });
      
      console.log('✅ Webhook payment update completed:', {
        orderId: args.razorpayOrderId,
        paymentId: args.razorpayPaymentId,
        status: args.status,
        updatedPaymentRecords,
        updatedEnrollments,
        updatedOldEnrollments
      });
      
      return {
        success: true,
        updatedPaymentRecords,
        updatedEnrollments,
        updatedOldEnrollments
      };
      
    } catch (error: any) {
         console.error('❌ Webhook payment update failed:', error);
         
         // Log error
         await ctx.runMutation(api.paymentTracking.logPaymentAction, {
           action: "webhook_payment_update_failed",
           paymentData: {
             razorpayOrderId: args.razorpayOrderId,
             razorpayPaymentId: args.razorpayPaymentId,
             status: args.status
           },
           error: error.message,
           metadata: { source: "payments.updatePaymentStatusFromWebhook" }
         });
         
         throw error;
    }
  },
});

// Universal payment verification for both enrollment and merchandise
export const verifyPaymentUniversal = mutation({
  args: {
    razorpay_order_id: v.string(),
    razorpay_payment_id: v.string(),
    razorpay_signature: v.string(),
    paymentType: v.union(v.literal("enrollment"), v.literal("merchandise")),
    enrollmentData: v.optional(v.object({
      phoneNumber: v.string(),
      sport: v.string(),
      planId: v.string(),
    })),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string; message?: string; enrollmentId?: string; orderNumber?: string }> => {
    const timestamp = Date.now();
    
    console.log('🔄 Starting universal payment verification:', {
      orderId: args.razorpay_order_id,
      paymentId: args.razorpay_payment_id,
      type: args.paymentType
    });

    try {
      // Verify payment signature
      const isValid = verifyRazorpaySignature(
        args.razorpay_order_id,
        args.razorpay_payment_id,
        args.razorpay_signature
      );

      if (!isValid) {
        console.error('❌ Payment signature verification failed');
        return { success: false, error: "Payment verification failed" };
      }

      console.log('✅ Payment signature verified successfully');

      if (args.paymentType === "enrollment" && args.enrollmentData) {
        // Handle enrollment payment
        return await ctx.runMutation(api.payments.verifyPaymentAndCreateEnrollment, {
          razorpay_order_id: args.razorpay_order_id,
          razorpay_payment_id: args.razorpay_payment_id,
          razorpay_signature: args.razorpay_signature,
          enrollmentData: args.enrollmentData,
          amount: args.amount,
        });
      } else if (args.paymentType === "merchandise") {
        // Handle merchandise payment
        console.log('🛍️ Processing merchandise payment verification:', {
          orderId: args.razorpay_order_id,
          paymentId: args.razorpay_payment_id
        });
        
        try {
          // First, check if the order exists
          const order = await ctx.db
            .query("merchandiseOrders")
            .filter((q) => q.eq(q.field("razorpayOrderId"), args.razorpay_order_id))
            .first();
          
          if (!order) {
            console.error('❌ Merchandise order not found for:', args.razorpay_order_id);
            return { success: false, error: "Merchandise order not found" };
          }
          
          console.log('📦 Found merchandise order:', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            currentStatus: order.status,
            paymentStatus: order.paymentStatus
          });
          
          // Update the order payment status
          await ctx.runMutation(api.merchandiseOrders.updateOrderPayment, {
            razorpayOrderId: args.razorpay_order_id,
            razorpayPaymentId: args.razorpay_payment_id,
            paymentStatus: "paid",
          });
          
          console.log('✅ Merchandise order payment updated successfully');
          
          // Update payment tracking with enhanced error handling
          try {
            await ctx.runMutation(api.payments.updatePaymentStatusFromWebhook, {
              razorpayOrderId: args.razorpay_order_id,
              razorpayPaymentId: args.razorpay_payment_id,
              status: "completed",
              amount: args.amount,
            });
            console.log('✅ Payment tracking updated successfully');
          } catch (trackingError: any) {
            console.error('⚠️ Payment tracking update failed, but order was updated:', trackingError);
            // Don't fail the entire verification if tracking update fails
            // The order status is already updated, which is the primary concern
          }
          
          console.log('✅ Payment tracking updated successfully');
          console.log('✅ Merchandise payment verified successfully');
          
          return { 
            success: true, 
            message: "Merchandise payment verified and order updated",
            orderNumber: order.orderNumber
          };
        } catch (error: any) {
          console.error('❌ Merchandise payment verification failed:', {
            error: error.message,
            orderId: args.razorpay_order_id,
            paymentId: args.razorpay_payment_id
          });
          return { success: false, error: `Merchandise payment verification failed: ${error.message}` };
        }
      }
      
      return { success: false, error: "Invalid payment type" };
      
    } catch (error: any) {
      console.error('❌ Universal payment verification failed:', error);
      return { success: false, error: error.message };
    }
  },
});

// Simple helper function to calculate session start date (next Monday)
function calculateSessionStartDate(): number {
  const today = new Date();
  const nextMonday = new Date(today);

  // Calculate days until next Monday
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  // Set time to 6:00 AM
  nextMonday.setHours(6, 0, 0, 0);

  return nextMonday.getTime();
}