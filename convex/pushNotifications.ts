"use node";

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

// Send push notifications action
export const sendPushNotifications = action({
  args: {
    notificationId: v.id("notifications"),
    targetUsers: v.array(v.id("users")),
    notificationData: v.object({
      title: v.string(),
      body: v.string(),
      icon: v.optional(v.string()),
      badge: v.optional(v.string()),
      tag: v.optional(v.string()),
      data: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    // Initialize Firebase Admin if not already initialized
    if (admin.apps.length === 0) {
      try {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw new Error('Failed to initialize Firebase Admin');
      }
    }

    console.log(`📱 Sending push notifications to ${args.targetUsers.length} users`);
    
    let successCount = 0;
    let failureCount = 0;
    const results: Array<{ userId: Id<"users">; success: boolean; error?: string }> = [];
    
    for (const userId of args.targetUsers) {
      try {
        const user = await ctx.runQuery(api.users.getUserById, { userId });
        if (!user || !user.fcmToken) {  // Assume user has fcmToken field
          failureCount++;
          continue;
        }
        const message = {
          token: user.fcmToken,
          notification: {
            title: args.notificationData.title,
            body: args.notificationData.body,
          },
          data: args.notificationData.data || {},
        };
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        successCount++;
        await ctx.runMutation(api.notifications.updateDeliveryStatus, {
          notificationId: args.notificationId,
          userId,
          status: "delivered",
          deliveredAt: Date.now()
        });
      } catch (error) {
        console.error('Error sending push:', error);
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await ctx.runMutation(api.notifications.updateDeliveryStatus, {
          notificationId: args.notificationId,
          userId,
          status: "failed",
          failureReason: errorMessage
        });
      }
    }
    
    console.log(`✅ Push notifications sent: ${successCount} success, ${failureCount} failed`);
    
    return {
      success: true,
      totalSent: args.targetUsers.length,
      successCount,
      failureCount,
      results
    };
  },
});

// Note: updateDeliveryStatus moved to notifications.ts since mutations cannot be in Node.js files

// Note: getPushNotificationStats moved to notifications.ts since queries cannot be in Node.js files

// Note: registerFCMToken moved to users.ts since mutations cannot be in Node.js files

// Simulate push notification sending (for development/testing)
async function simulatePushNotification(params: {
  userId: Id<"users">;
  userPhone?: string;
  notification: any;
}): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05;
  
  if (success) {
    console.log(`📱 Push notification sent to user ${params.userId}`);
    return { success: true };
  } else {
    const error = 'Simulated delivery failure';
    console.warn(`⚠️ Push notification failed for user ${params.userId}: ${error}`);
    return { success: false, error };
  }
}

// Test push notification system
export const testPushNotifications = action({
  args: {
    userIds: v.optional(v.array(v.id("users"))),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    notificationId?: string;
    targetUsers?: number;
    pushResult?: any;
    error?: string;
  }> => {
    let targetUsers: Id<"users">[] | undefined = args.userIds;
    
    if (!targetUsers || targetUsers.length === 0) {
      // Get first 5 active users for testing
      const users: any[] = await ctx.runQuery(api.users.getAllUsers, {});
      targetUsers = users.map((u: any) => u._id);
    }
    
    if (!targetUsers || targetUsers.length === 0) {
      return { success: false, error: "No users found for testing" };
    }
    
    // Create test notification
    const notificationResult: any = await ctx.runMutation(api.notifications.sendNotification, {
      title: "🧪 Test Notification",
      message: args.message || "This is a test push notification from PlayGram admin panel.",
      type: "info",
      targetType: "all_users",
      priority: "medium",
    });
    
    // Send push notifications
    const pushResult: any = await ctx.runAction(api.pushNotifications.sendPushNotifications, {
      notificationId: notificationResult.notificationId,
      targetUsers,
      notificationData: {
        title: "🧪 Test Notification",
        body: args.message || "This is a test push notification from PlayGram admin panel.",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "test-notification",
        data: {
          type: "test",
          url: "/"
        }
      }
    });
    
    return {
      success: true,
      notificationId: notificationResult.notificationId,
      targetUsers: targetUsers.length,
      pushResult
    };
  },
});