import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// Fix enrollments that don't have session schedules
export const fixEnrollmentsWithoutSessions = mutation({
  args: {
    phoneNumber: v.optional(v.string()),
    enrollmentId: v.optional(v.id("userEnrollments")),
  },
  handler: async (ctx, args) => {
    let enrollmentsToFix: Doc<"userEnrollments">[] = [];
    
    if (args.enrollmentId) {
      // Fix specific enrollment
      const enrollment = await ctx.db.get(args.enrollmentId);
      if (enrollment) {
        enrollmentsToFix = [enrollment];
      }
    } else if (args.phoneNumber) {
      // Fix all enrollments for a specific user
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
        .first();
      
      if (user) {
        enrollmentsToFix = await ctx.db
          .query("userEnrollments")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
          .collect();
      }
    } else {
      // Fix all enrollments without sessions
      const allEnrollments = await ctx.db
        .query("userEnrollments")
        .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
        .collect();
      
      // Check which enrollments don't have sessions
      for (const enrollment of allEnrollments) {
        const existingSessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();
        
        if (existingSessions.length === 0) {
          enrollmentsToFix.push(enrollment);
        }
      }
    }
    
    console.log(`🔄 Found ${enrollmentsToFix.length} enrollments to fix`);
    
    const results: Array<{
      enrollmentId: string;
      status: "fixed" | "skipped" | "failed";
      sessionCount?: number;
      userId?: string;
      batchId?: string;
      reason?: string;
      error?: string;
    }> = [];
    
    for (const enrollment of enrollmentsToFix) {
      try {
        // Check if sessions already exist
        const existingSessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();
        
        if (existingSessions.length > 0) {
          console.log(`⏭️ Enrollment ${enrollment._id} already has ${existingSessions.length} sessions, skipping`);
          results.push({
            enrollmentId: enrollment._id,
            status: "skipped",
            reason: "Already has sessions",
            sessionCount: existingSessions.length
          });
          continue;
        }
        
        // Generate session schedules
        console.log(`🔄 Generating sessions for enrollment: ${enrollment._id}`);
        
        await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
          enrollmentId: enrollment._id,
          batchId: enrollment.batchId,
          sessionsTotal: enrollment.sessionsTotal,
          startDate: enrollment.startDate,
        });
        
        // Verify sessions were created
        const newSessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();
        
        console.log(`✅ Generated ${newSessions.length} sessions for enrollment: ${enrollment._id}`);
        
        results.push({
          enrollmentId: enrollment._id,
          status: "fixed",
          sessionCount: newSessions.length,
          userId: enrollment.userId,
          batchId: enrollment.batchId
        });
        
      } catch (error: any) {
        console.error(`❌ Failed to fix enrollment ${enrollment._id}:`, error);
        results.push({
          enrollmentId: enrollment._id,
          status: "failed",
          error: error?.message || "Unknown error"
        });
      }
    }
    
    return {
      totalProcessed: enrollmentsToFix.length,
      results,
      summary: {
        fixed: results.filter(r => r.status === "fixed").length,
        skipped: results.filter(r => r.status === "skipped").length,
        failed: results.filter(r => r.status === "failed").length
      }
    };
  },
});

// Get enrollments without sessions for debugging
export const getEnrollmentsWithoutSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const enrollments = await ctx.db
      .query("userEnrollments")
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .take(limit);
    
    const enrollmentsWithoutSessions = [];
    
    for (const enrollment of enrollments) {
      const sessions = await ctx.db
        .query("sessionSchedules")
        .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
        .collect();
      
      if (sessions.length === 0) {
        // Get user and batch info
        const user = await ctx.db.get(enrollment.userId);
        const batch = await ctx.db.get(enrollment.batchId);
        
        enrollmentsWithoutSessions.push({
          ...enrollment,
          user: {
            phone: user?.phone,
            name: user?.fullName || user?.name
          },
          batch: {
            name: batch?.name,
            sport: batch?.sportId
          },
          sessionCount: sessions.length
        });
      }
    }
    
    return enrollmentsWithoutSessions;
  },
});

// Get session count for a specific enrollment
export const getEnrollmentSessionCount = query({
  args: {
    enrollmentId: v.id("userEnrollments"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return { error: "Enrollment not found" };
    }
    
    const sessions = await ctx.db
      .query("sessionSchedules")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .collect();
    
    const user = await ctx.db.get(enrollment.userId);
    const batch = await ctx.db.get(enrollment.batchId);
    
    return {
      enrollmentId: args.enrollmentId,
      sessionsTotal: enrollment.sessionsTotal,
      sessionsScheduled: sessions.length,
      user: {
        phone: user?.phone,
        name: user?.fullName || user?.name
      },
      batch: {
        name: batch?.name
      },
      sessions: sessions.map(s => ({
        sessionNumber: s.sessionNumber,
        scheduledDate: s.scheduledDate,
        status: s.status
      }))
    };
  },
});

// Fix enrollments where sessionsTotal doesn't match actual session count
export const fixSessionsTotalMismatch = mutation({
  args: {},
  handler: async (ctx) => {
    const allEnrollments = await ctx.db
      .query("userEnrollments")
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();
    
    console.log(`🔄 Checking ${allEnrollments.length} active enrollments for session count mismatches`);
    
    const results: Array<{
      enrollmentId: string;
      status: "fixed" | "skipped" | "failed";
      oldSessionsTotal?: number;
      newSessionsTotal?: number;
      actualSessionsScheduled?: number;
      error?: string;
    }> = [];
    
    for (const enrollment of allEnrollments) {
      try {
        // Get actual session count
        const sessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();
        
        const actualSessionCount = sessions.length;
        const recordedSessionTotal = enrollment.sessionsTotal;
        
        // Check if there's a mismatch
        if (actualSessionCount !== recordedSessionTotal) {
          console.log(`🔧 Fixing enrollment ${enrollment._id}: recorded=${recordedSessionTotal}, actual=${actualSessionCount}`);
          
          // Update the enrollment record
          await ctx.db.patch(enrollment._id, {
            sessionsTotal: actualSessionCount,
            updatedAt: Date.now(),
          });
          
          results.push({
            enrollmentId: enrollment._id,
            status: "fixed",
            oldSessionsTotal: recordedSessionTotal,
            newSessionsTotal: actualSessionCount,
            actualSessionsScheduled: actualSessionCount
          });
        } else {
          results.push({
            enrollmentId: enrollment._id,
            status: "skipped",
            oldSessionsTotal: recordedSessionTotal,
            newSessionsTotal: recordedSessionTotal,
            actualSessionsScheduled: actualSessionCount
          });
        }
        
      } catch (error: any) {
        console.error(`❌ Failed to fix enrollment ${enrollment._id}:`, error);
        results.push({
          enrollmentId: enrollment._id,
          status: "failed",
          error: error?.message || "Unknown error"
        });
      }
    }
    
    const summary = {
      fixed: results.filter(r => r.status === "fixed").length,
      skipped: results.filter(r => r.status === "skipped").length,
      failed: results.filter(r => r.status === "failed").length
    };
    
    console.log(`🎉 Session total fix completed! Fixed: ${summary.fixed}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`);
    
    return {
      totalProcessed: allEnrollments.length,
      results,
      summary
    };
  },
});

// Fix enrollments with pending payment status that have sessions
export const fixPendingPaymentStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const pendingEnrollments = await ctx.db
      .query("userEnrollments")
      .filter((q) => 
        q.and(
          q.eq(q.field("enrollmentStatus"), "active"),
          q.eq(q.field("paymentStatus"), "pending")
        )
      )
      .collect();
    
    console.log(`🔄 Found ${pendingEnrollments.length} enrollments with pending payment status`);
    
    const results: Array<{
      enrollmentId: string;
      status: "fixed" | "skipped" | "failed";
      oldPaymentStatus?: string;
      newPaymentStatus?: string;
      sessionsCount?: number;
      error?: string;
    }> = [];
    
    for (const enrollment of pendingEnrollments) {
      try {
        // Check if enrollment has sessions (indicating it was processed)
        const sessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();
        
        if (sessions.length > 0 && enrollment.razorpayOrderId) {
          // Has sessions and payment order ID, likely a successful payment that wasn't updated
          console.log(`🔧 Fixing payment status for enrollment ${enrollment._id}: ${sessions.length} sessions found`);
          
          await ctx.db.patch(enrollment._id, {
            paymentStatus: "paid",
            updatedAt: Date.now(),
          });
          
          results.push({
            enrollmentId: enrollment._id,
            status: "fixed",
            oldPaymentStatus: "pending",
            newPaymentStatus: "paid",
            sessionsCount: sessions.length
          });
        } else {
          results.push({
            enrollmentId: enrollment._id,
            status: "skipped",
            oldPaymentStatus: "pending",
            newPaymentStatus: "pending",
            sessionsCount: sessions.length
          });
        }
        
      } catch (error: any) {
        console.error(`❌ Failed to fix payment status for enrollment ${enrollment._id}:`, error);
        results.push({
          enrollmentId: enrollment._id,
          status: "failed",
          error: error?.message || "Unknown error"
        });
      }
    }
    
    const summary = {
      fixed: results.filter(r => r.status === "fixed").length,
      skipped: results.filter(r => r.status === "skipped").length,
      failed: results.filter(r => r.status === "failed").length
    };
    
    console.log(`🎉 Payment status fix completed! Fixed: ${summary.fixed}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`);
    
    return {
      totalProcessed: pendingEnrollments.length,
      results,
      summary
    };
  },
});