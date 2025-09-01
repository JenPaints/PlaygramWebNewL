import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// Send a message to batch chat
export const sendMessage = mutation({
  args: {
    batchId: v.id("batches"),
    phoneNumber: v.string(),
    content: v.string(),
    messageType: v.optional(v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("announcement")
    )),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    isAnnouncement: v.optional(v.boolean()),
    replyToMessageId: v.optional(v.id("batchChatMessages")),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is enrolled in this batch or is admin/coach
    const isEnrolled = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user_batch", (q) => q.eq("userId", user._id).eq("batchId", args.batchId))
      .first();

    const isCoachOrAdmin = user.userType === "coach" || user.userType === "admin";

    if (!isEnrolled && !isCoachOrAdmin) {
      throw new Error("Not authorized to send messages to this batch");
    }

    // Determine sender type
    let senderType: "student" | "coach" | "admin" = "student";
    if (user.userType === "admin") {
      senderType = "admin";
    } else if (user.userType === "coach") {
      senderType = "coach";
    }

    // Create message
    const messageId = await ctx.db.insert("batchChatMessages", {
      batchId: args.batchId,
      senderId: user._id,
      senderType,
      messageType: args.messageType || "text",
      content: args.content,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      isAnnouncement: args.isAnnouncement || false,
      isEdited: false,
      replyToMessageId: args.replyToMessageId,
      readBy: [{
        userId: user._id,
        readAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If this is from a student, create notification for admins
    if (senderType === "student") {
      await ctx.db.insert("notifications", {
        title: "New Batch Message",
        message: `${user.name || user.phone} sent a message in batch chat`,
        type: "info",
        targetType: "all_admins",
        senderId: user._id,
        priority: "medium",
        actionUrl: `/admin/batch-chats/${args.batchId}`,
        actionText: "View Chat",
        isRead: false,
        sentAt: Date.now(),
        createdAt: Date.now(),
      });
    }

    return messageId;
  },
});

// Get chat messages for a batch
export const getBatchMessages = query({
  args: {
    batchId: v.id("batches"),
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has access to this batch
    const isEnrolled = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user_batch", (q) => q.eq("userId", user._id).eq("batchId", args.batchId))
      .first();

    const isCoachOrAdmin = user.userType === "coach" || user.userType === "admin";

    if (!isEnrolled && !isCoachOrAdmin) {
      throw new Error("Not authorized to view this batch chat");
    }

    // Get messages
    const limit = args.limit || 50;
    let query = ctx.db
      .query("batchChatMessages")
      .withIndex("by_batch_time", (q) => q.eq("batchId", args.batchId))
      .order("desc");

    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("createdAt"), parseInt(args.cursor!)));
    }

    const messages = await query.take(limit);

    // Get sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: {
            _id: sender?._id,
            name: sender?.name,
            phone: sender?.phone,
            userType: sender?.userType,
            image: sender?.image,
          },
        };
      })
    );

    return {
      messages: messagesWithSenders.reverse(), // Return in chronological order
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[messages.length - 1].createdAt.toString() : null,
    };
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    batchId: v.id("batches"),
    phoneNumber: v.string(),
    messageIds: v.array(v.id("batchChatMessages")),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }

    // Update read status for each message
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message && message.batchId === args.batchId) {
        const readBy = message.readBy || [];
        const existingRead = readBy.find(r => r.userId === user._id);
        
        if (!existingRead) {
          readBy.push({
            userId: user._id,
            readAt: Date.now(),
          });
          
          await ctx.db.patch(messageId, {
            readBy,
            updatedAt: Date.now(),
          });
        }
      }
    }
  },
});

// Get unread message count for a batch
export const getUnreadCount = query({
  args: {
    batchId: v.id("batches"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      return 0;
    }

    // Get all messages in batch
    const messages = await ctx.db
      .query("batchChatMessages")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();

    // Count unread messages
    let unreadCount = 0;
    for (const message of messages) {
      const isRead = message.readBy?.some(r => r.userId === user._id);
      if (!isRead && message.senderId !== user._id) {
        unreadCount++;
      }
    }

    return unreadCount;
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("batchChatMessages"),
    phoneNumber: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender or admin can edit
    if (message.senderId !== user._id && user.userType !== "admin") {
      throw new Error("Not authorized to edit this message");
    }

    // Can only edit within 15 minutes
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - message.createdAt > fifteenMinutes && user.userType !== "admin") {
      throw new Error("Message can only be edited within 15 minutes");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
      editedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("batchChatMessages"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender or admin can delete
    if (message.senderId !== user._id && user.userType !== "admin") {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.delete(args.messageId);
  },
});

// Get batch chat participants
export const getBatchParticipants = query({
  args: {
    batchId: v.id("batches"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phoneNumber))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }

    // Get all enrollments for this batch
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();

    // Get user details for each enrollment
    const participants = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        return {
          _id: user?._id,
          name: user?.name,
          phone: user?.phone,
          userType: user?.userType || "student",
          image: user?.image,
          studentId: user?.studentId,
        };
      })
    );

    // Get batch details to include coach info
    const batch = await ctx.db.get(args.batchId);
    
    return {
      participants: participants.filter(p => p._id),
      batchInfo: {
        name: batch?.name,
        coachName: batch?.coachName,
        coachImage: batch?.coachImage,
      },
    };
  },
});