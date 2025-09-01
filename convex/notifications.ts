import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// Send notification to target users
export const sendNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("announcement")
    ),
    targetType: v.union(
      v.literal("all_users"),
      v.literal("all_students"),
      v.literal("all_coaches"),
      v.literal("all_admins"),
      v.literal("specific_user"),
      v.literal("batch_members"),
      v.literal("location_users")
    ),
    targetId: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Temporarily remove authentication for debugging
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   throw new Error("Not authenticated");
    // }

    // const user = await ctx.db.get(userId);
    // if (!user) {
    //   throw new Error("User not found");
    // }

    // // Only admins can send notifications
    // if (user.userType !== "admin") {
    //   throw new Error("Only admins can send notifications");
    // }

    // Create the notification
    // Find any user to use as senderId, or create a system notification without senderId
    const anyUser = await ctx.db.query("users").first();
    
    const notificationData: any = {
      title: args.title,
      message: args.message,
      type: args.type,
      targetType: args.targetType,
      targetId: args.targetId,
      priority: args.priority || "medium",
      actionUrl: args.actionUrl,
      actionText: args.actionText,
      imageUrl: args.imageUrl,
      expiresAt: args.expiresAt,
      isRead: false,
      sentAt: Date.now(),
      createdAt: Date.now(),
    };
    
    // Only add senderId if we have a valid user
    if (anyUser) {
      notificationData.senderId = anyUser._id;
    }
    
    const notificationId = await ctx.db.insert("notifications", notificationData);

    // Get target users based on targetType
    let targetUsers: Id<"users">[] = [];

    switch (args.targetType) {
      case "all_users":
        const allUsers = await ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .collect();
        targetUsers = allUsers.map(u => u._id);
        break;

      case "all_students":
        const students = await ctx.db
          .query("users")
          .withIndex("by_user_type", (q) => q.eq("userType", "student"))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        targetUsers = students.map(u => u._id);
        break;

      case "all_coaches":
        const coaches = await ctx.db
          .query("users")
          .withIndex("by_user_type", (q) => q.eq("userType", "coach"))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        targetUsers = coaches.map(u => u._id);
        break;

      case "all_admins":
        const admins = await ctx.db
          .query("users")
          .withIndex("by_user_type", (q) => q.eq("userType", "admin"))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        targetUsers = admins.map(u => u._id);
        break;

      case "specific_user":
        if (args.targetId) {
          targetUsers = [args.targetId as Id<"users">];
        }
        break;

      case "batch_members":
        if (args.targetId) {
          const enrollments = await ctx.db
            .query("userEnrollments")
            .withIndex("by_batch", (q) => q.eq("batchId", args.targetId as Id<"batches">))
            .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
            .collect();
          targetUsers = enrollments.map(e => e.userId);
        }
        break;

      case "location_users":
        if (args.targetId) {
          // Get all batches at this location
          const batches = await ctx.db
            .query("batches")
            .withIndex("by_location", (q) => q.eq("locationId", args.targetId as Id<"locations">))
            .collect();
          
          // Get all enrollments for these batches
          const allEnrollments = [];
          for (const batch of batches) {
            const enrollments = await ctx.db
              .query("userEnrollments")
              .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
              .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
              .collect();
            allEnrollments.push(...enrollments);
          }
          
          // Get unique user IDs
          const uniqueUserIds = [...new Set(allEnrollments.map(e => e.userId))];
          targetUsers = uniqueUserIds;
        }
        break;
    }

    // Create user notification records
    for (const targetUserId of targetUsers) {
      await ctx.db.insert("userNotifications", {
        userId: targetUserId,
        notificationId,
        deliveryStatus: "delivered",
        deliveredAt: Date.now(),
        createdAt: Date.now(),
      });
    }

    console.log(`✅ Notification sent to ${targetUsers.length} users`);
    
    // Note: Push notifications would be handled by a separate action/service
    // This ensures the notification is stored in the database for real-time updates
    
    return { notificationId, targetUsers: targetUsers.length };
  },
});

// Get push notification statistics
export const getPushNotificationStats = query({
  args: {
    notificationId: v.optional(v.id("notifications")),
    timeRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let userNotifications;
    
    if (args.notificationId) {
      // Get stats for specific notification
      userNotifications = await ctx.db
        .query("userNotifications")
        .withIndex("by_notification", (q) => q.eq("notificationId", args.notificationId!))
        .collect();
    } else {
      // Get all notifications within time range
      userNotifications = await ctx.db
        .query("userNotifications")
        .collect();
      
      if (args.timeRange) {
        userNotifications = userNotifications.filter(un => 
          un.createdAt >= args.timeRange!.start && 
          un.createdAt <= args.timeRange!.end
        );
      }
    }
    
    // Calculate statistics
    const stats = {
      total: userNotifications.length,
      pending: userNotifications.filter(un => un.deliveryStatus === "pending").length,
      delivered: userNotifications.filter(un => un.deliveryStatus === "delivered").length,
      failed: userNotifications.filter(un => un.deliveryStatus === "failed").length,
      read: userNotifications.filter(un => un.deliveryStatus === "read").length,
      deliveryRate: 0,
      readRate: 0,
    };
    
    if (stats.total > 0) {
      stats.deliveryRate = (stats.delivered + stats.read) / stats.total;
      stats.readRate = stats.read / stats.total;
    }
    
    return stats;
  },
});

// Update delivery status mutation
export const updateDeliveryStatus = mutation({
  args: {
    notificationId: v.id("notifications"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("read")
    ),
    deliveredAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the user notification record
    const userNotification = await ctx.db
      .query("userNotifications")
      .withIndex("by_user_notification", (q) => 
        q.eq("userId", args.userId).eq("notificationId", args.notificationId)
      )
      .first();
    
    if (!userNotification) {
      console.warn(`⚠️ User notification not found: ${args.userId} - ${args.notificationId}`);
      return { success: false, error: "User notification not found" };
    }
    
    // Update the delivery status
    const updates: any = {
      deliveryStatus: args.status,
    };
    
    if (args.deliveredAt) {
      updates.deliveredAt = args.deliveredAt;
    }
    
    if (args.readAt) {
      updates.readAt = args.readAt;
    }
    
    if (args.failureReason) {
      updates.failureReason = args.failureReason;
    }
    
    await ctx.db.patch(userNotification._id, updates);
    
    return { success: true };
  },
});

// Get notifications for current user
export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
    userId: v.optional(v.id("users")), // Add userId as parameter for testing
  },
  handler: async (ctx, args) => {
    // Temporarily disable auth for testing
    let userId = await getAuthUserId(ctx);
    
    // If no auth, use provided userId or get any user for testing
    if (!userId) {
      if (args.userId) {
        userId = args.userId;
      } else {
        // Get any user for testing
        const anyUser = await ctx.db.query("users").first();
        if (!anyUser) return [];
        userId = anyUser._id;
      }
    }

    const limit = args.limit || 20;
    
    // Get user notification records
    let query = ctx.db
      .query("userNotifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("deliveryStatus"), "delivered"));
    }

    const userNotifications = await query.take(limit);

    // Get notification details
    const notifications = await Promise.all(
      userNotifications.map(async (userNotif) => {
        const notification = await ctx.db.get(userNotif.notificationId);
        if (!notification) return null;

        // Check if notification is expired
        if (notification.expiresAt && Date.now() > notification.expiresAt) {
          return null;
        }

        const sender = await ctx.db.get(notification.senderId);
        
        return {
          ...notification,
          userNotificationId: userNotif._id,
          deliveryStatus: userNotif.deliveryStatus,
          deliveredAt: userNotif.deliveredAt,
          readAt: userNotif.readAt,
          sender: {
            _id: sender?._id,
            name: sender?.name,
            userType: sender?.userType,
          },
        };
      })
    );

    return notifications.filter(n => n !== null);
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: {
    userNotificationId: v.id("userNotifications"),
  },
  handler: async (ctx, args) => {
    // Temporarily disable authentication for testing
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   throw new Error("Not authenticated");
    // }

    const userNotification = await ctx.db.get(args.userNotificationId);
    if (!userNotification) {
      throw new Error("Notification not found");
    }

    // Temporarily disable authorization check for testing
    // if (userNotification.userId !== userId) {
    //   throw new Error("Not authorized to mark this notification as read");
    // }

    await ctx.db.patch(args.userNotificationId, {
      deliveryStatus: "read",
      readAt: Date.now(),
    });
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {
    userId: v.optional(v.id("users")), // Add userId as parameter for testing
  },
  handler: async (ctx, args) => {
    // Temporarily disable auth for testing
    let userId = await getAuthUserId(ctx);
    
    // If no auth, use provided userId or get any user for testing
    if (!userId) {
      if (args.userId) {
        userId = args.userId;
      } else {
        // Get any user for testing
        const anyUser = await ctx.db.query("users").first();
        if (!anyUser) return 0;
        userId = anyUser._id;
      }
    }

    const unreadNotifications = await ctx.db
      .query("userNotifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deliveryStatus"), "delivered"))
      .collect();

    // Filter out expired notifications
    let count = 0;
    for (const userNotif of unreadNotifications) {
      const notification = await ctx.db.get(userNotif.notificationId);
      if (notification && (!notification.expiresAt || Date.now() <= notification.expiresAt)) {
        count++;
      }
    }

    return count;
  },
});

// Delete notification (admin only)
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    // Temporarily disable auth for testing
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   throw new Error("Not authenticated");
    // }

    // const user = await ctx.db.get(userId);
    // if (!user || user.userType !== "admin") {
    //   throw new Error("Only admins can delete notifications");
    // }

    // Delete all user notification records
    const userNotifications = await ctx.db
      .query("userNotifications")
      .withIndex("by_notification", (q) => q.eq("notificationId", args.notificationId))
      .collect();

    for (const userNotif of userNotifications) {
      await ctx.db.delete(userNotif._id);
    }

    // Delete the notification
    await ctx.db.delete(args.notificationId);
  },
});

// Get all notifications (admin only)
export const getAllNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Temporarily disable auth for testing
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   return [];
    // }

    // const user = await ctx.db.get(userId);
    // if (!user || user.userType !== "admin") {
    //   return [];
    // }

    const limit = args.limit || 50;
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_sent_time")
      .order("desc")
      .take(limit);

    // Get delivery stats for each notification
    const notificationsWithStats = await Promise.all(
      notifications.map(async (notification) => {
        const userNotifications = await ctx.db
          .query("userNotifications")
          .withIndex("by_notification", (q) => q.eq("notificationId", notification._id))
          .collect();

        const deliveredCount = userNotifications.filter(un => un.deliveryStatus === "delivered" || un.deliveryStatus === "read").length;
        const readCount = userNotifications.filter(un => un.deliveryStatus === "read").length;
        const failedCount = userNotifications.filter(un => un.deliveryStatus === "failed").length;

        const sender = await ctx.db.get(notification.senderId);

        return {
          ...notification,
          stats: {
            totalTargets: userNotifications.length,
            delivered: deliveredCount,
            read: readCount,
            failed: failedCount,
            readRate: deliveredCount > 0 ? Math.round((readCount / deliveredCount) * 100) : 0,
          },
          sender: {
            _id: sender?._id,
            name: sender?.name,
            userType: sender?.userType,
          },
        };
      })
    );

    return notificationsWithStats;
  },
});

// Get notification preferences for user
export const getNotificationPreferences = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!preferences) {
      // Return default preferences
      return {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        batchChatNotifications: true,
        announcementNotifications: true,
        sessionReminders: true,
        paymentReminders: true,
        quietHours: {
          enabled: false,
          startTime: "22:00",
          endTime: "08:00",
        },
      };
    }

    return preferences;
  },
});

// Update notification preferences
export const updateNotificationPreferences = mutation({
  args: {
    userId: v.optional(v.string()), // Add userId as optional parameter
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    smsNotifications: v.optional(v.boolean()),
    batchChatNotifications: v.optional(v.boolean()),
    announcementNotifications: v.optional(v.boolean()),
    sessionReminders: v.optional(v.boolean()),
    paymentReminders: v.optional(v.boolean()),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.string(),
      endTime: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Try to get authenticated user ID first
    let userId: Id<"users"> | null = null;
    try {
      userId = await getAuthUserId(ctx);
    } catch (error) {
      // If auth fails, we'll use a fallback approach
      console.log('Auth failed, using fallback approach');
    }
    
    // If no authenticated user but we have a phone number, find the user ID
    if (!userId && args.userId) {
      // Find user by phone number to get the actual user ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.userId!))
        .first();
      
      if (user) {
        userId = user._id;
      } else {
        console.log('User not found for phone:', args.userId);
        // Create a temporary user record or skip preferences
        throw new Error("User not found. Please ensure you are registered.");
      }
    }
    
    if (!userId) {
      throw new Error("Unable to identify user for notification preferences");
    }

    const existingPreferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .first();

    const now = Date.now();

    if (existingPreferences) {
      // Update existing preferences
      const updates: any = { updatedAt: now };
      
      if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications;
      if (args.pushNotifications !== undefined) updates.pushNotifications = args.pushNotifications;
      if (args.smsNotifications !== undefined) updates.smsNotifications = args.smsNotifications;
      if (args.batchChatNotifications !== undefined) updates.batchChatNotifications = args.batchChatNotifications;
      if (args.announcementNotifications !== undefined) updates.announcementNotifications = args.announcementNotifications;
      if (args.sessionReminders !== undefined) updates.sessionReminders = args.sessionReminders;
      if (args.paymentReminders !== undefined) updates.paymentReminders = args.paymentReminders;
      if (args.quietHours !== undefined) updates.quietHours = args.quietHours;

      await ctx.db.patch(existingPreferences._id, updates);
    } else {
      // Create new preferences
      await ctx.db.insert("notificationPreferences", {
        userId: userId!,
        emailNotifications: args.emailNotifications ?? true,
        pushNotifications: args.pushNotifications ?? true,
        smsNotifications: args.smsNotifications ?? false,
        batchChatNotifications: args.batchChatNotifications ?? true,
        announcementNotifications: args.announcementNotifications ?? true,
        sessionReminders: args.sessionReminders ?? true,
        paymentReminders: args.paymentReminders ?? true,
        quietHours: args.quietHours ?? {
          enabled: false,
          startTime: "22:00",
          endTime: "08:00",
        },
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});