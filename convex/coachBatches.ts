import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get batches assigned to a coach by phone number
export const getCoachBatches = query({
  args: {
    coachPhone: v.string(),
  },
  handler: async (ctx, args) => {
    // First, find the coach user by phone number
    const coach = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.coachPhone))
      .filter((q) => q.eq(q.field("userType"), "coach"))
      .first();

    if (!coach) {
      return [];
    }

    // Get all batches where this coach is assigned
    // Method 1: Check coachAssignments table
    const coachAssignments = await ctx.db
      .query("coachAssignments")
      .withIndex("by_coach", (q) => q.eq("coachId", coach._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const batchesByAssignment = await Promise.all(
      coachAssignments.map(assignment => ctx.db.get(assignment.batchId))
    );
    const validBatchesByAssignment = batchesByAssignment.filter(batch => batch !== null);

    // Method 2: Check batches by coachName field (fallback)
    const batchesByCoachName = await ctx.db
      .query("batches")
      .filter((q) => q.eq(q.field("coachName"), coach.name || coach.phone))
      .collect();

    // Combine both methods and remove duplicates
    const allBatches = [...validBatchesByAssignment, ...batchesByCoachName];
    const uniqueBatches = allBatches.filter((batch, index, self) => 
      index === self.findIndex(b => b._id === batch._id)
    );

    // Get additional details for each batch
    const batchesWithDetails = await Promise.all(
      uniqueBatches.map(async (batch) => {
        // Get sport details
        const sport = batch.sportId ? await ctx.db.get(batch.sportId) : null;
        
        // Get location details
        const location = batch.locationId ? await ctx.db.get(batch.locationId) : null;
        
        // Get enrollment count
        const enrollments = await ctx.db
          .query("userEnrollments")
          .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
          .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
          .collect();

        return {
          ...batch,
          sport,
          location,
          currentEnrollments: enrollments.length,
          enrollments,
        };
      })
    );

    return batchesWithDetails;
  },
});

// Get coach assignments (if using separate coach assignment table)
export const getCoachAssignments = query({
  args: {
    coachPhone: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the coach user by phone number
    const coach = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.coachPhone))
      .filter((q) => q.eq(q.field("userType"), "coach"))
      .first();

    if (!coach) {
      return [];
    }

    // Get coach assignments if the table exists
    try {
      const assignments = await ctx.db
        .query("coachAssignments")
        .withIndex("by_coach", (q) => q.eq("coachId", coach._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      // Get batch details for each assignment
      const assignmentsWithBatches = await Promise.all(
        assignments.map(async (assignment) => {
          const batch = await ctx.db.get(assignment.batchId);
          if (!batch) return null;

          // Get sport and location details
          const sport = batch.sportId ? await ctx.db.get(batch.sportId) : null;
          const location = batch.locationId ? await ctx.db.get(batch.locationId) : null;

          // Get enrollment count
          const enrollments = await ctx.db
            .query("userEnrollments")
            .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
            .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
            .collect();

          return {
            assignment,
            batch: {
              ...batch,
              sport,
              location,
              currentEnrollments: enrollments.length,
              enrollments,
            },
          };
        })
      );

      return assignmentsWithBatches.filter(item => item !== null);
    } catch (error) {
      // If coachAssignments table doesn't exist, return empty array
      return [];
    }
  },
});

// Get all batches for admin/coach management
export const getAllBatches = query({
  handler: async (ctx) => {
    const batches = await ctx.db
      .query("batches")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get additional details for each batch
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        // Get sport details
        const sport = batch.sportId ? await ctx.db.get(batch.sportId) : null;
        
        // Get location details
        const location = batch.locationId ? await ctx.db.get(batch.locationId) : null;
        
        // Get enrollment count
        const enrollments = await ctx.db
          .query("userEnrollments")
          .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
          .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
          .collect();

        return {
          ...batch,
          sport,
          location,
          currentEnrollments: enrollments.length,
        };
      })
    );

    return batchesWithDetails;
  },
});