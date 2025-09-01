import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Create test notifications for students
export const createTestNotifications = mutation({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get any user if none provided
    let targetUserId = args.userId;
    if (!targetUserId) {
      const anyUser = await ctx.db.query("users").first();
      if (!anyUser) return { error: "No users found" };
      targetUserId = anyUser._id;
    }

    const testNotifications = [
      {
        title: "Good Morning! Ready for Training?",
        message: "Your football session starts in 2 hours. Don't forget to bring your gear!",
        type: "info" as const,
        priority: "medium" as const,
      },
      {
        title: "Session Reminder",
        message: "Your basketball training starts in 1 hour 15 minutes. See you on the court!",
        type: "warning" as const,
        priority: "high" as const,
      },
      {
        title: "Low Session Alert",
        message: "You have only 3 sessions remaining. Consider upgrading your package to continue training.",
        type: "warning" as const,
        priority: "urgent" as const,
      },
      {
        title: "Achievement Unlocked!",
        message: "Congratulations! You've completed 10 training sessions this month. Keep up the great work!",
        type: "success" as const,
        priority: "medium" as const,
      },
      {
        title: "Merchandise Order Confirmed",
        message: "Your order for Football Jersey (Size M) has been confirmed. Expected delivery: 3-5 days.",
        type: "success" as const,
        priority: "low" as const,
      },
      {
        title: "Payment Reminder",
        message: "Your monthly subscription payment is due in 3 days. Please ensure sufficient balance.",
        type: "warning" as const,
        priority: "high" as const,
      },
      {
        title: "Welcome to PlayGram!",
        message: "Welcome to our sports training platform. We're excited to help you achieve your fitness goals!",
        type: "announcement" as const,
        priority: "medium" as const,
      }
    ];

    const createdNotifications = [];

    for (const notif of testNotifications) {
      // Create notification
      const notificationId = await ctx.db.insert("notifications", {
        title: notif.title,
        message: notif.message,
        type: notif.type,
        targetType: "specific_user",
        targetId: targetUserId,
        senderId: targetUserId, // Use same user as sender for testing
        priority: notif.priority,
        isRead: false,
        sentAt: Date.now(),
        createdAt: Date.now(),
      });

      // Create user notification record
      const userNotificationId = await ctx.db.insert("userNotifications", {
        userId: targetUserId,
        notificationId,
        deliveryStatus: "delivered",
        deliveredAt: Date.now(),
        createdAt: Date.now(),
      });

      createdNotifications.push({ notificationId, userNotificationId });
    }

    return {
      success: true,
      count: createdNotifications.length,
      notifications: createdNotifications,
    };
  },
});

// Create daily morning reminder
export const createMorningReminder = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user has sessions today
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get user's enrollments
    const enrollments = await ctx.db
      .query("userEnrollments")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .filter(q => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();

    if (enrollments.length === 0) return { message: "No active enrollments" };

    // Check if any batch has session today
    let hasSessionToday = false;
    for (const enrollment of enrollments) {
      const batch = await ctx.db.get(enrollment.batchId);
      if (batch && batch.schedule) {
        const todaySchedule = batch.schedule.find((s: any) => s.day === dayName);
        if (todaySchedule) {
          hasSessionToday = true;
          break;
        }
      }
    }

    if (!hasSessionToday) return { message: "No sessions today" };

    // Create morning reminder notification
    const notificationId = await ctx.db.insert("notifications", {
      title: "Good Morning! Training Day Ahead",
      message: `Good morning! You have training sessions scheduled for today. Stay hydrated and bring your gear!`,
      type: "info",
      targetType: "specific_user",
      targetId: args.userId,
      senderId: args.userId,
      priority: "medium",
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    });

    // Create user notification record
    await ctx.db.insert("userNotifications", {
      userId: args.userId,
      notificationId,
      deliveryStatus: "delivered",
      deliveredAt: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true, notificationId };
  },
});

// Create session reminder (1 hour 15 minutes before)
export const createSessionReminder = mutation({
  args: {
    userId: v.id("users"),
    batchId: v.id("batches"),
    sessionTime: v.string(),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.batchId);
    if (!batch) return { error: "Batch not found" };

    const sport = await ctx.db.get(batch.sportId);
    const location = await ctx.db.get(batch.locationId);

    const notificationId = await ctx.db.insert("notifications", {
      title: "Session Starting Soon!",
      message: `Your ${sport?.name || 'training'} session at ${location?.name || 'the venue'} starts at ${args.sessionTime}. Don't be late!`,
      type: "warning",
      targetType: "specific_user",
      targetId: args.userId,
      senderId: args.userId,
      priority: "high",
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("userNotifications", {
      userId: args.userId,
      notificationId,
      deliveryStatus: "delivered",
      deliveredAt: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true, notificationId };
  },
});

// Create low session count alert
export const createLowSessionAlert = mutation({
  args: {
    userId: v.id("users"),
    remainingSessions: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.remainingSessions > 5) {
      return { message: "Session count is not low" };
    }

    const notificationId = await ctx.db.insert("notifications", {
      title: "Low Session Alert",
      message: `You have only ${args.remainingSessions} sessions remaining. Consider upgrading your package to continue your training journey!`,
      type: "warning",
      targetType: "specific_user",
      targetId: args.userId,
      senderId: args.userId,
      priority: "urgent",
      actionUrl: "/dashboard/coaching",
      actionText: "Upgrade Package",
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("userNotifications", {
      userId: args.userId,
      notificationId,
      deliveryStatus: "delivered",
      deliveredAt: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true, notificationId };
  },
});

// Create merchandise order notification
export const createMerchandiseOrderNotification = mutation({
  args: {
    userId: v.id("users"),
    orderId: v.id("merchandiseOrders"),
    itemName: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const statusMessages = {
      confirmed: "Your order has been confirmed and is being processed.",
      shipped: "Your order has been shipped and is on its way!",
      delivered: "Your order has been delivered. Enjoy your new gear!",
    };

    const message = statusMessages[args.status as keyof typeof statusMessages] || "Your order status has been updated.";

    const notificationId = await ctx.db.insert("notifications", {
      title: `Order ${args.status.charAt(0).toUpperCase() + args.status.slice(1)}`,
      message: `${args.itemName}: ${message}`,
      type: "success",
      targetType: "specific_user",
      targetId: args.userId,
      senderId: args.userId,
      priority: "low",
      actionUrl: `/dashboard/merchandise/orders/${args.orderId}`,
      actionText: "View Order",
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert("userNotifications", {
      userId: args.userId,
      notificationId,
      deliveryStatus: "delivered",
      deliveredAt: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true, notificationId };
  },
});

// Get all users for batch notifications
export const getAllActiveUsers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();
  },
});