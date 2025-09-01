import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Add sessions to a student's enrollment
export const addSessionsToStudent = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    sessionsToAdd: v.number(),
    reason: v.string(),
    notes: v.optional(v.string()),
    adjustedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Get the enrollment
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    
    // Get the user
    const user = await ctx.db.get(enrollment.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get admin details
    let adminName = "System Admin";
    if (args.adjustedBy) {
      const admin = await ctx.db.get(args.adjustedBy);
      if (admin) {
        adminName = admin.fullName || admin.name || "Admin";
      }
    }
    
    const previousTotal = enrollment.sessionsTotal;
    const newTotal = previousTotal + args.sessionsToAdd;
    
    // Update the enrollment
    await ctx.db.patch(args.enrollmentId, {
      sessionsTotal: newTotal,
      updatedAt: timestamp,
    });
    
    // Create adjustment record
    await ctx.db.insert("sessionAdjustments", {
      enrollmentId: args.enrollmentId,
      userId: enrollment.userId,
      studentId: user.studentId || user.phone || "Unknown",
      adjustmentType: "add_sessions",
      sessionsAdjusted: args.sessionsToAdd,
      previousSessionsTotal: previousTotal,
      newSessionsTotal: newTotal,
      reason: args.reason,
      adjustedBy: args.adjustedBy,
      adjustedByName: adminName,
      notes: args.notes,
      createdAt: timestamp,
    });
    
    return {
      success: true,
      previousTotal,
      newTotal,
      sessionsAdded: args.sessionsToAdd,
    };
  },
});

// Remove sessions from a student's enrollment
export const removeSessionsFromStudent = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    sessionsToRemove: v.number(),
    reason: v.string(),
    notes: v.optional(v.string()),
    adjustedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Get the enrollment
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    
    // Get the user
    const user = await ctx.db.get(enrollment.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get admin details
    let adminName = "System Admin";
    if (args.adjustedBy) {
      const admin = await ctx.db.get(args.adjustedBy);
      if (admin) {
        adminName = admin.fullName || admin.name || "Admin";
      }
    }
    
    const previousTotal = enrollment.sessionsTotal;
    const newTotal = Math.max(0, previousTotal - args.sessionsToRemove); // Don't go below 0
    
    // Update the enrollment
    await ctx.db.patch(args.enrollmentId, {
      sessionsTotal: newTotal,
      updatedAt: timestamp,
    });
    
    // Create adjustment record
    await ctx.db.insert("sessionAdjustments", {
      enrollmentId: args.enrollmentId,
      userId: enrollment.userId,
      studentId: user.studentId || user.phone || "Unknown",
      adjustmentType: "remove_sessions",
      sessionsAdjusted: -args.sessionsToRemove, // Negative for removal
      previousSessionsTotal: previousTotal,
      newSessionsTotal: newTotal,
      reason: args.reason,
      adjustedBy: args.adjustedBy,
      adjustedByName: adminName,
      notes: args.notes,
      createdAt: timestamp,
    });
    
    return {
      success: true,
      previousTotal,
      newTotal,
      sessionsRemoved: args.sessionsToRemove,
    };
  },
});

// Get all session adjustments for a specific enrollment
export const getSessionAdjustments = query({
  args: {
    enrollmentId: v.id("userEnrollments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionAdjustments")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .order("desc")
      .collect();
  },
});

// Get all session adjustments for admin dashboard
export const getAllSessionAdjustments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("sessionAdjustments")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);
  },
});

// Get session adjustments by student ID
export const getSessionAdjustmentsByStudent = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionAdjustments")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();
  },
});

// Get all enrollments with user details for the admin interface
export const getEnrollmentsForSessionManagement = query({
  handler: async (ctx) => {
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_status", (q) => q.eq("enrollmentStatus", "active"))
      .collect();
    
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        const batch = await ctx.db.get(enrollment.batchId);
        
        let sport = null;
        if (batch) {
          sport = await ctx.db.get(batch.sportId);
        }
        
        return {
          ...enrollment,
          user: {
            _id: user?._id,
            name: user?.fullName || user?.name || "Unknown",
            studentId: user?.studentId,
            phone: user?.phone,
            email: user?.email,
          },
          batch: {
            _id: batch?._id,
            name: batch?.name,
          },
          sport: {
            _id: sport?._id,
            name: sport?.name,
          },
        };
      })
    );
    
    return enrichedEnrollments;
  },
});

// Search enrollments by student ID or name
export const searchEnrollments = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase();
    
    // Get all active enrollments
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_status", (q) => q.eq("enrollmentStatus", "active"))
      .collect();
    
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        const batch = await ctx.db.get(enrollment.batchId);
        
        let sport = null;
        if (batch) {
          sport = await ctx.db.get(batch.sportId);
        }
        
        return {
          ...enrollment,
          user: {
            _id: user?._id,
            name: user?.fullName || user?.name || "Unknown",
            studentId: user?.studentId,
            phone: user?.phone,
            email: user?.email,
          },
          batch: {
            _id: batch?._id,
            name: batch?.name,
          },
          sport: {
            _id: sport?._id,
            name: sport?.name,
          },
        };
      })
    );
    
    // Filter by search term
    return enrichedEnrollments.filter((enrollment) => {
      const userName = enrollment.user.name?.toLowerCase() || "";
      const studentId = enrollment.user.studentId?.toLowerCase() || "";
      const phone = enrollment.user.phone?.toLowerCase() || "";
      
      return (
        userName.includes(searchTerm) ||
        studentId.includes(searchTerm) ||
        phone.includes(searchTerm)
      );
    });
  },
});