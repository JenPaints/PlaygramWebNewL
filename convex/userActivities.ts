import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Get recent user activities for admin dashboard
export const getRecentActivities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    
    return activities;
  },
});

// Get activities by user
export const getActivitiesByUser = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
    
    return activities;
  },
});

// Get activities by type
export const getActivitiesByType = query({
  args: { 
    activityType: v.union(
      v.literal("login"),
      v.literal("logout"),
      v.literal("enrollment"),
      v.literal("payment"),
      v.literal("profile_update"),
      v.literal("batch_view"),
      v.literal("coaching_view"),
      v.literal("merchandise_purchase"),
      v.literal("session_attendance")
    ),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_activity_type", (q) => q.eq("activityType", args.activityType))
      .order("desc")
      .take(limit);
    
    return activities;
  },
});

// Get activities in date range
export const getActivitiesInRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_timestamp")
      .filter((q) => 
        q.and(
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .order("desc")
      .take(limit);
    
    return activities;
  },
});

// Get activity statistics
export const getActivityStatistics = query({
  args: {
    days: v.optional(v.number()) // Number of days to look back
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), startDate))
      .collect();
    
    // Count activities by type
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get unique users
    const uniqueUsers = new Set(activities.map(a => a.userId)).size;
    
    // Calculate daily averages
    const dailyAverage = activities.length / days;
    
    return {
      totalActivities: activities.length,
      uniqueUsers,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      activityCounts,
      periodDays: days,
    };
  },
});

// Get most active users
export const getMostActiveUsers = query({
  args: {
    limit: v.optional(v.number()),
    days: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), startDate))
      .collect();
    
    // Count activities per user
    const userActivityCounts = activities.reduce((acc, activity) => {
      acc[activity.userId] = (acc[activity.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort and get top users
    const sortedUsers = Object.entries(userActivityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
    
    // Get user details
    const userDetails = await Promise.all(
      sortedUsers.map(async ([userId, count]) => {
        const user = await ctx.db.get(userId as any);
        return {
          user,
          activityCount: count,
        };
      })
    );
    
    return userDetails.filter(item => item.user !== null);
  },
});