import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Debug function to check specific user's payment status
export const debugUserPayment = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🔍 Debugging payment for user: ${args.phoneNumber}`);
    
    // Check user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
    
    console.log('👤 User record:', user);
    
    // Check userEnrollments (new system)
    const userEnrollments = user ? await ctx.db
      .query("userEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect() : [];
    
    console.log('📚 User enrollments:', userEnrollments);
    
    // Check old enrollments
    const oldEnrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();
    
    console.log('📚 Old enrollments:', oldEnrollments);
    
    // Check payment records
    const paymentRecords = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.phoneNumber))
      .collect();
    
    console.log('💳 Payment records:', paymentRecords);
    
    // Check payment orders
    const paymentOrders = await ctx.db
      .query("payment_orders")
      .withIndex("by_phone", (q) => q.eq("userPhone", args.phoneNumber))
      .collect();
    
    console.log('🧾 Payment orders:', paymentOrders);
    
    return {
      user,
      userEnrollments,
      oldEnrollments,
      paymentRecords,
      paymentOrders,
      summary: {
        userFound: !!user,
        userEnrollmentsCount: userEnrollments.length,
        oldEnrollmentsCount: oldEnrollments.length,
        paymentRecordsCount: paymentRecords.length,
        paymentOrdersCount: paymentOrders.length,
        pendingPayments: paymentRecords.filter(p => p.status === 'pending').length,
        completedPayments: paymentRecords.filter(p => p.status === 'completed').length,
      }
    };
  },
});

// Fix payment status for specific user
export const fixUserPaymentStatus = mutation({
  args: {
    phoneNumber: v.string(),
    paymentId: v.optional(v.id("payments")),
  },
  handler: async (ctx, args) => {
    console.log(`🔧 Fixing payment status for user: ${args.phoneNumber}`);
    
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get user enrollments
    const userEnrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    // Find paid enrollments that have pending payment records
    const paidEnrollments = userEnrollments.filter(e => e.paymentStatus === 'paid');
    
    let updatedCount = 0;
    
    for (const enrollment of paidEnrollments) {
      // Find corresponding payment record
      const paymentRecord = await ctx.db
        .query("payments")
        .withIndex("by_user", (q) => q.eq("userId", args.phoneNumber))
        .filter((q) => q.eq(q.field("details.enrollmentId"), enrollment._id))
        .first();
      
      if (paymentRecord && paymentRecord.status === 'pending') {
        // Update payment status to completed
        await ctx.db.patch(paymentRecord._id, {
          status: 'completed',
          updatedAt: Date.now(),
        });
        
        console.log(`✅ Updated payment ${paymentRecord._id} to completed`);
        updatedCount++;
      }
    }
    
    // Log the fix action
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "manual_payment_status_fix",
      paymentData: {
        phoneNumber: args.phoneNumber,
        updatedPayments: updatedCount,
        paidEnrollments: paidEnrollments.length,
      },
      metadata: { source: "debugPayment.fixUserPaymentStatus" }
    });
    
    return {
      success: true,
      updatedPayments: updatedCount,
      message: `Updated ${updatedCount} payment records from pending to completed`,
    };
  },
});

// Bulk fix payment status for all users with paid enrollments but pending payments
export const fixAllPendingPayments = mutation({
  args: {},
  handler: async (ctx, args) => {
    console.log('🔧 Starting bulk fix for all pending payment issues...');
    
    const timestamp = Date.now();
    let totalUpdated = 0;
    let usersFixed = 0;
    const fixedUsers = [];
    
    // Log bulk fix start
    await ctx.runMutation(api.paymentTracking.logPaymentAction, {
      action: "bulk_payment_status_fix_start",
      paymentData: { timestamp },
      metadata: { source: "debugPayment.fixAllPendingPayments" }
    });
    
    try {
      // Get all users
      const allUsers = await ctx.db.query("users").collect();
      
      for (const user of allUsers) {
        if (!user.phone) continue;
        
        // Get user enrollments
        const userEnrollments = await ctx.db
          .query("userEnrollments")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        // Find paid enrollments
        const paidEnrollments = userEnrollments.filter(e => e.paymentStatus === 'paid');
        
        if (paidEnrollments.length === 0) continue;
        
        let userUpdatedCount = 0;
        
        for (const enrollment of paidEnrollments) {
          // Find corresponding payment record
          const paymentRecord = await ctx.db
            .query("payments")
            .withIndex("by_user", (q) => q.eq("userId", user.phone!))
            .filter((q) => q.eq(q.field("details.enrollmentId"), enrollment._id))
            .first();
          
          if (paymentRecord && paymentRecord.status === 'pending') {
            // Update payment status to completed
            await ctx.db.patch(paymentRecord._id, {
              status: 'completed',
              updatedAt: timestamp,
            });
            
            console.log(`✅ Fixed payment ${paymentRecord._id} for user ${user.phone}`);
            userUpdatedCount++;
            totalUpdated++;
          }
        }
        
        if (userUpdatedCount > 0) {
          usersFixed++;
          fixedUsers.push({
            phone: user.phone,
            studentId: user.studentId,
            updatedPayments: userUpdatedCount,
          });
        }
      }
      
      // Log bulk fix completion
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "bulk_payment_status_fix_complete",
        paymentData: {
          totalUpdated,
          usersFixed,
          fixedUsers: fixedUsers.slice(0, 10), // Log first 10 users
        },
        metadata: { source: "debugPayment.fixAllPendingPayments" }
      });
      
      console.log(`🎉 Bulk fix completed! Updated ${totalUpdated} payments for ${usersFixed} users`);
      
      return {
        success: true,
        totalUpdated,
        usersFixed,
        fixedUsers,
        message: `Successfully fixed ${totalUpdated} pending payments for ${usersFixed} users`,
      };
      
    } catch (error) {
      // Log bulk fix error
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "bulk_payment_status_fix_error",
        paymentData: { totalUpdated, usersFixed },
        error: error instanceof Error ? error.message : String(error),
        metadata: { source: "debugPayment.fixAllPendingPayments" }
      });
      
      console.error('❌ Bulk fix failed:', error);
      throw error;
    }
  },
});

// Comprehensive payment synchronization function
export const syncAllPaymentStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Starting comprehensive payment status synchronization...');
    
    let totalFixed = 0;
    let usersProcessed = 0;
    const errors = [];
    
    try {
      // Get all user enrollments with paid status
      const paidEnrollments = await ctx.db
        .query("userEnrollments")
        .withIndex("by_payment_status", (q) => q.eq("paymentStatus", "paid"))
        .collect();
      
      console.log(`📊 Found ${paidEnrollments.length} paid enrollments to sync`);
      
      // Group by user to process efficiently
      const enrollmentsByUser = new Map();
      for (const enrollment of paidEnrollments) {
        const user = await ctx.db.get(enrollment.userId);
        if (user?.phone) {
          if (!enrollmentsByUser.has(user.phone)) {
            enrollmentsByUser.set(user.phone, []);
          }
          enrollmentsByUser.get(user.phone).push(enrollment);
        }
      }
      
      // Process each user
      for (const [phoneNumber, enrollments] of enrollmentsByUser) {
        try {
          usersProcessed++;
          
          // Find pending payment records for this user
          const pendingPayments = await ctx.db
            .query("payments")
            .withIndex("by_user", (q) => q.eq("userId", phoneNumber))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();
          
          // Update pending payments that have corresponding paid enrollments
           for (const payment of pendingPayments) {
             const matchingEnrollment = enrollments.find((e: any) => 
               e.razorpayOrderId === payment.details.razorpayOrderId ||
               e.razorpayOrderId === payment.details.orderId
             );
             
             if (matchingEnrollment) {
               await ctx.db.patch(payment._id, {
                 status: "completed",
                 details: {
                   ...payment.details,
                   razorpayPaymentId: matchingEnrollment.razorpayPaymentId
                 },
                 updatedAt: Date.now()
               });
               totalFixed++;
               
               console.log(`✅ Fixed payment ${payment._id} for user ${phoneNumber}`);
             }
           }
           
         } catch (userError: any) {
           console.error(`❌ Error processing user ${phoneNumber}:`, userError);
           errors.push({ phoneNumber, error: userError.message });
        }
      }
      
      // Log the synchronization results
      await ctx.runMutation(api.paymentTracking.logPaymentAction, {
        action: "comprehensive_payment_sync_completed",
        paymentData: {
          totalFixed,
          usersProcessed,
          errorsCount: errors.length
        },
        metadata: { source: "debugPayment.syncAllPaymentStatuses" }
      });
      
      console.log('✅ Payment synchronization completed:', {
        totalFixed,
        usersProcessed,
        errorsCount: errors.length
      });
      
      return {
        success: true,
        message: `Payment synchronization completed successfully`,
        totalFixed,
        usersProcessed,
        errors
      };
      
    } catch (error: any) {
       console.error('❌ Payment synchronization failed:', error);
       
       await ctx.runMutation(api.paymentTracking.logPaymentAction, {
         action: "comprehensive_payment_sync_failed",
         paymentData: { totalFixed, usersProcessed },
         error: error.message,
         metadata: { source: "debugPayment.syncAllPaymentStatuses" }
       });
       
       throw error;
    }
  },
});