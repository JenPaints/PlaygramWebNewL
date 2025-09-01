import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new sports program
export const createSportsProgram = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    ageGroups: v.array(v.string()),
    skillLevels: v.array(v.string()),
    equipment: v.array(v.string()),
    benefits: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const sportId = await ctx.db.insert("sportsPrograms", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return sportId;
  },
});

// Get all sports programs
export const getAllSportsPrograms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sportsPrograms").collect();
  },
});

// Get active sports programs
export const getActiveSportsPrograms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sportsPrograms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get sports programs by category
export const getSportsProgramsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sportsPrograms")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Update sports program
export const updateSportsProgram = mutation({
  args: {
    id: v.id("sportsPrograms"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    ageGroups: v.optional(v.array(v.string())),
    skillLevels: v.optional(v.array(v.string())),
    equipment: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
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

// Delete sports program
export const deleteSportsProgram = mutation({
  args: { id: v.id("sportsPrograms") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get sports program by ID
export const getSportsProgramById = query({
  args: { id: v.id("sportsPrograms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get sports categories
export const getSportsCategories = query({
  args: {},
  handler: async (ctx) => {
    const sports = await ctx.db.query("sportsPrograms").collect();
    const categories = [...new Set(sports.map(sport => sport.category))];
    return categories.sort();
  },
});

// Get sports programs with batch count
export const getSportsProgramsWithBatchCount = query({
  args: {},
  handler: async (ctx) => {
    const sports = await ctx.db
      .query("sportsPrograms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const sportsWithBatchCount = await Promise.all(
      sports.map(async (sport) => {
        const batches = await ctx.db
          .query("batches")
          .withIndex("by_sport", (q) => q.eq("sportId", sport._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();
        
        return {
          ...sport,
          batchCount: batches.length,
          totalCapacity: batches.reduce((sum, batch) => sum + batch.maxCapacity, 0),
          totalEnrollments: batches.reduce((sum, batch) => sum + batch.currentEnrollments, 0),
        };
      })
    );
    
    return sportsWithBatchCount;
  },
});