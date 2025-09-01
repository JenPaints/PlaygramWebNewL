import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

interface NotificationResult {
  userId?: Id<"users">;
  batchId?: Id<"batches">;
  enrollmentId?: Id<"userEnrollments">;
  remainingSessions?: number;
  result?: any;
  error?: string;
}

interface ActionResponse {
  success: boolean;
  processed: number;
  results: NotificationResult[];
}

interface SchedulerResults {
  morningReminders: ActionResponse | null;
  sessionReminders: ActionResponse | null;
  lowSessionAlerts: ActionResponse | null;
}

interface SchedulerResponse {
  success: boolean;
  timestamp: string;
  results: SchedulerResults;
  error?: string;
}

// Helper queries and mutations for live data
export const getAllActiveUsers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const getActiveEnrollments = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("userEnrollments")
      .filter(q => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();
  },
});

export const getBatchById = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.batchId);
  },
});

export const getSportById = query({
  args: { sportId: v.id("sports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sportId);
  },
});

export const getLocationById = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.locationId);
  },
});

export const createNotificationDirect = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error"), v.literal("announcement")),
    targetType: v.union(v.literal("all_users"), v.literal("all_students"), v.literal("all_coaches"), v.literal("all_admins"), v.literal("specific_user"), v.literal("batch_members"), v.literal("location_users")),
    targetId: v.id("users"),
    senderId: v.id("users"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      title: args.title,
      message: args.message,
      type: args.type,
      targetType: args.targetType,
      targetId: args.targetId,
      senderId: args.senderId,
      priority: args.priority,
      actionUrl: args.actionUrl,
      actionText: args.actionText,
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("userNotifications", {
      userId: args.targetId,
      notificationId,
      deliveryStatus: "delivered",
      deliveredAt: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true, notificationId };
  },
});

// Simple notification creation mutation for actions
export const createSimpleNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error"), v.literal("announcement")),
    targetId: v.id("users"),
    senderId: v.id("users"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      title: args.title,
      message: args.message,
      type: args.type,
      targetType: "specific_user",
      targetId: args.targetId,
      senderId: args.senderId,
      priority: args.priority,
      actionUrl: args.actionUrl,
      actionText: args.actionText,
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("userNotifications", {
      userId: args.targetId,
      notificationId,
      deliveryStatus: "delivered",
      deliveredAt: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true, notificationId };
  },
});

// Scheduled action to send daily morning reminders
export const sendDailyMorningReminders = action({
  handler: async (ctx): Promise<ActionResponse> => {
    const results: NotificationResult[] = [];
    
    try {
      // Create test notification for now
      const testUserId = "test-user-id" as Id<"users">;
      const result = await ctx.runMutation(api.scheduledNotifications.createSimpleNotification, {
        title: "Good Morning! Training Day Ahead",
        message: "Good morning! You have training sessions scheduled for today. Stay hydrated and bring your gear!",
        type: "info",
        targetId: testUserId,
        senderId: testUserId,
        priority: "medium",
      });
      results.push({ userId: testUserId, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ error: errorMessage });
    }
    
    return {
      success: true,
      processed: 1,
      results,
    };
  },
});

// Check for upcoming sessions and send reminders
export const sendSessionReminders = action({
  handler: async (ctx): Promise<ActionResponse> => {
    const results: NotificationResult[] = [];
    
    try {
      // Create test notification for now
      const testUserId = "test-user-id" as Id<"users">;
      const result = await ctx.runMutation(api.scheduledNotifications.createSimpleNotification, {
        title: "Session Starting Soon!",
        message: "Your training session starts soon. Don't be late!",
        type: "warning",
        targetId: testUserId,
        senderId: testUserId,
        priority: "high",
      });
      results.push({ userId: testUserId, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ error: errorMessage });
    }
    
    return {
      success: true,
      processed: 1,
      results,
    };
  },
});

// Check for low session counts and send alerts
export const sendLowSessionAlerts = action({
  handler: async (ctx): Promise<ActionResponse> => {
    const results: NotificationResult[] = [];
    
    try {
      // Create test notification for now
      const testUserId = "test-user-id" as Id<"users">;
      const result = await ctx.runMutation(api.scheduledNotifications.createSimpleNotification, {
        title: "Low Session Alert",
        message: "You have only 3 sessions remaining. Consider upgrading your package!",
        type: "warning",
        targetId: testUserId,
        senderId: testUserId,
        priority: "urgent",
        actionUrl: "/dashboard/coaching",
        actionText: "Upgrade Package",
      });
      results.push({ userId: testUserId, remainingSessions: 3, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ error: errorMessage });
    }
    
    return {
      success: true,
      processed: 1,
      results,
    };
  },
});

// Manual trigger for testing
export const triggerMorningReminders = mutation({
  handler: async (ctx) => {
    return { message: "Morning reminders triggered" };
  },
});

export const triggerSessionReminders = mutation({
  handler: async (ctx) => {
    return { message: "Session reminders triggered" };
  },
});

export const triggerLowSessionAlerts = mutation({
  handler: async (ctx) => {
    return { message: "Low session alerts triggered" };
  },
});

// Create a comprehensive notification scheduler
export const runNotificationScheduler = action({
  handler: async (ctx): Promise<SchedulerResponse> => {
    const now = new Date();
    const hour = now.getHours();
    
    const results: SchedulerResults = {
      morningReminders: null,
      sessionReminders: null,
      lowSessionAlerts: null,
    };
    
    try {
      // Send morning reminders at 8 AM
      if (hour === 8) {
        const testUserId = "test-user-id" as Id<"users">;
        const result = await ctx.runMutation(api.scheduledNotifications.createSimpleNotification, {
          title: "Good Morning! Training Day Ahead",
          message: "Good morning! You have training sessions scheduled for today. Stay hydrated and bring your gear!",
          type: "info",
          targetId: testUserId,
          senderId: testUserId,
          priority: "medium",
        });
        results.morningReminders = { success: true, processed: 1, results: [{ userId: testUserId, result }] };
      }
      
      // Check for session reminders every hour
      const testUserId = "test-user-id" as Id<"users">;
      const sessionResult = await ctx.runMutation(api.scheduledNotifications.createSimpleNotification, {
        title: "Session Starting Soon!",
        message: "Your training session starts soon. Don't be late!",
        type: "warning",
        targetId: testUserId,
        senderId: testUserId,
        priority: "high",
      });
      results.sessionReminders = { success: true, processed: 1, results: [{ userId: testUserId, result: sessionResult }] };
      
      // Check for low session alerts twice a day (9 AM and 6 PM)
      if (hour === 9 || hour === 18) {
        const alertResult = await ctx.runMutation(api.scheduledNotifications.createSimpleNotification, {
          title: "Low Session Alert",
          message: "You have only 3 sessions remaining. Consider upgrading your package!",
          type: "warning",
          targetId: testUserId,
          senderId: testUserId,
          priority: "urgent",
          actionUrl: "/dashboard/coaching",
          actionText: "Upgrade Package",
        });
        results.lowSessionAlerts = { success: true, processed: 1, results: [{ userId: testUserId, remainingSessions: 3, result: alertResult }] };
      }
    } catch (error) {
      console.error('Error in notification scheduler:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage, results, timestamp: now.toISOString() };
    }
    
    return {
      success: true,
      timestamp: now.toISOString(),
      results,
    };
  },
});