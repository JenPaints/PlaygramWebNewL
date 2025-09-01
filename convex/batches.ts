import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new batch
export const createBatch = mutation({
  args: {
    sportId: v.id("sportsPrograms"),
    locationId: v.id("locations"),
    name: v.string(),
    description: v.optional(v.string()),
    coachName: v.string(),
    coachImage: v.optional(v.string()),
    ageGroup: v.string(),
    skillLevel: v.string(),
    maxCapacity: v.number(),
    schedule: v.array(v.object({
      day: v.string(),
      startTime: v.string(),
      endTime: v.string(),
    })),
    packages: v.array(v.object({
      duration: v.string(),
      price: v.number(),
      sessions: v.number(),
      features: v.array(v.string()),
    })),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const batchId = await ctx.db.insert("batches", {
      ...args,
      currentEnrollments: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return batchId;
  },
});

// Get all batches
export const getAllBatches = query({
  args: {},
  handler: async (ctx) => {
    const batches = await ctx.db.query("batches").collect();
    
    // Populate sport and location details
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        return {
          ...batch,
          sport,
          location,
        };
      })
    );
    
    return batchesWithDetails;
  },
});

// Get active batches
export const getActiveBatches = query({
  args: {},
  handler: async (ctx) => {
    const batches = await ctx.db
      .query("batches")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Populate sport and location details
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        return {
          ...batch,
          sport,
          location,
        };
      })
    );
    
    return batchesWithDetails;
  },
});

// Get batches by sport
export const getBatchesBySport = query({
  args: { sportId: v.id("sportsPrograms") },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_sport", (q) => q.eq("sportId", args.sportId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Populate location details
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        const location = await ctx.db.get(batch.locationId);
        return {
          ...batch,
          location,
        };
      })
    );
    
    return batchesWithDetails;
  },
});

// Get batches by location
export const getBatchesByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Populate sport details
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        const sport = await ctx.db.get(batch.sportId);
        return {
          ...batch,
          sport,
        };
      })
    );
    
    return batchesWithDetails;
  },
});

// Get batches by sport and location
export const getBatchesBySportAndLocation = query({
  args: {
    sportId: v.id("sportsPrograms"),
    locationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_sport_location", (q) => 
        q.eq("sportId", args.sportId).eq("locationId", args.locationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Update batch
export const updateBatch = mutation({
  args: {
    id: v.id("batches"),
    sportId: v.optional(v.id("sportsPrograms")),
    locationId: v.optional(v.id("locations")),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    coachName: v.optional(v.string()),
    coachImage: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
    skillLevel: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    schedule: v.optional(v.array(v.object({
      day: v.string(),
      startTime: v.string(),
      endTime: v.string(),
    }))),
    packages: v.optional(v.array(v.object({
      duration: v.string(),
      price: v.number(),
      sessions: v.number(),
      features: v.array(v.string()),
    }))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Update batch enrollment count
export const updateBatchEnrollmentCount = mutation({
  args: {
    batchId: v.id("batches"),
    increment: v.number(), // +1 for enrollment, -1 for unenrollment
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }
    
    const newCount = Math.max(0, batch.currentEnrollments + args.increment);
    
    await ctx.db.patch(args.batchId, {
      currentEnrollments: newCount,
      updatedAt: Date.now(),
    });
    
    return newCount;
  },
});

// Delete batch
export const deleteBatch = mutation({
  args: { id: v.id("batches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get batch by ID
export const getBatchById = query({
  args: { id: v.id("batches") },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.id);
    if (!batch) return null;
    
    const sport = await ctx.db.get(batch.sportId);
    const location = await ctx.db.get(batch.locationId);
    
    return {
      ...batch,
      sport,
      location,
    };
  },
});

// Get available batches (not full)
export const getAvailableBatches = query({
  args: {},
  handler: async (ctx) => {
    const batches = await ctx.db
      .query("batches")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const availableBatches = batches.filter(
      batch => batch.currentEnrollments < batch.maxCapacity
    );
    
    // Populate sport and location details
    const batchesWithDetails = await Promise.all(
      availableBatches.map(async (batch) => {
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        return {
          ...batch,
          sport,
          location,
          availableSlots: batch.maxCapacity - batch.currentEnrollments,
        };
      })
    );
    
    return batchesWithDetails;
  },
});

// Get batch statistics
export const getBatchStatistics = query({
  args: {},
  handler: async (ctx) => {
    const batches = await ctx.db.query("batches").collect();
    
    const stats = {
      totalBatches: batches.length,
      activeBatches: batches.filter(b => b.isActive).length,
      totalCapacity: batches.reduce((sum, batch) => sum + batch.maxCapacity, 0),
      totalEnrollments: batches.reduce((sum, batch) => sum + batch.currentEnrollments, 0),
      averageCapacityUtilization: batches.length > 0 
        ? (batches.reduce((sum, batch) => sum + (batch.currentEnrollments / batch.maxCapacity), 0) / batches.length) * 100
        : 0,
      fullBatches: batches.filter(b => b.currentEnrollments >= b.maxCapacity).length,
    };
    
    return stats;
  },
});