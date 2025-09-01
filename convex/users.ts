import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to generate unique referral code
const generateUniqueReferralCode = async (ctx: any, studentId: string): Promise<string> => {
  const generateRandomLetters = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  };

  let referralCode: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    const randomSuffix = generateRandomLetters();
    referralCode = `${studentId}${randomSuffix}`;
    
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q: any) => q.eq("referralCode", referralCode))
      .first();
    
    if (!existingUser) {
      isUnique = true;
    }
    
    attempts++;
  }

  if (!isUnique) {
    throw new Error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
  }

  return referralCode!;
};

// Get all users for admin dashboard
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .collect();
    
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      status: user.status,
      studentId: user.studentId,
      city: user.city,
      createdAt: user.createdAt,
      lastActivity: user.lastActivity,
      totalEnrollments: user.totalEnrollments,
      totalSessions: user.totalSessions,
    }));
  },
});

// Get user statistics
export const getUserStatistics = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === "active").length;
    const coachUsers = users.filter(user => user.userType === "coach").length;
    const adminUsers = users.filter(user => user.userType === "admin").length;
    const studentUsers = users.filter(user => user.userType === "student" || !user.userType).length;
    
    // Calculate growth (mock for now - would need historical data)
    const growthRate = 12.5;
    
    return {
      totalUsers,
      activeUsers,
      coachUsers,
      adminUsers,
      studentUsers,
      growthRate,
      inactiveUsers: totalUsers - activeUsers,
    };
  },
});

// Get recent users (last 30 days)
export const getRecentUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const recentUsers = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .order("desc")
      .take(limit);
    
    return recentUsers;
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Get users by type
export const getUsersByType = query({
  args: { userType: v.union(v.literal("student"), v.literal("parent"), v.literal("coach"), v.literal("admin")) },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_user_type", (q) => q.eq("userType", args.userType))
      .collect();
    
    return users;
  },
});

// Create a new coach
export const createCoach = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    fullName: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user with this phone already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existingUser) {
      // Update existing user to coach
      await ctx.db.patch(existingUser._id, {
        userType: "coach",
        name: args.name,
        fullName: args.fullName || args.name,
        email: args.email,
        status: "active",
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new coach user
      const coachId = await ctx.db.insert("users", {
        name: args.name,
        fullName: args.fullName || args.name,
        email: args.email,
        phone: args.phone,
        userType: "coach",
        status: "active",
        isAnonymous: false,
        registrationSource: "admin_created",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActivity: Date.now(),
        totalEnrollments: 0,
        totalSessions: 0,
        totalLoginSessions: 0,
      });
      return coachId;
    }
  },
});

// Update user type (e.g., student to coach)
export const updateUserType = mutation({
  args: {
    userId: v.id("users"),
    userType: v.union(v.literal("student"), v.literal("parent"), v.literal("coach"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      userType: args.userType,
      updatedAt: Date.now(),
    });

    return { success: true, userId: args.userId, newUserType: args.userType };
  },
});

// Update user status
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true, userId: args.userId, newStatus: args.status };
  },
});

// Get user by phone number (for login routing)
export const getUserByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    
    return user;
  },
});

// Delete user (soft delete by setting status to inactive)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    return { success: true, userId: args.userId };
  },
});

// Get users by status
export const getUsersByStatus = query({
  args: { status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Generate referral codes for existing users
export const generateReferralCodesForExistingUsers = mutation({
  handler: async (ctx) => {
    const usersWithoutReferralCode = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.neq(q.field("studentId"), undefined),
          q.eq(q.field("referralCode"), undefined)
        )
      )
      .collect();

    console.log(`Found ${usersWithoutReferralCode.length} users without referral codes`);
    let processed = 0;

    for (const user of usersWithoutReferralCode) {
      if (user.studentId) {
        try {
          const referralCode = await generateUniqueReferralCode(ctx, user.studentId);
          
          await ctx.db.patch(user._id, {
            referralCode,
            updatedAt: Date.now(),
          });
          
          processed++;
          console.log(`Generated referral code ${referralCode} for user ${user.studentId}`);
        } catch (error) {
          console.error(`Failed to generate referral code for user ${user.studentId}:`, error);
        }
      }
    }

    return {
      processed,
      total: usersWithoutReferralCode.length,
      message: `Generated referral codes for ${processed} out of ${usersWithoutReferralCode.length} users`,
    };
  },
});

// Update user with referral code (for new user creation)
export const ensureUserHasReferralCode = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // If user already has a referral code, return it
    if (user.referralCode) {
      return user.referralCode;
    }
    
    // If user has studentId but no referral code, generate one
    if (user.studentId) {
      const referralCode = await generateUniqueReferralCode(ctx, user.studentId);
      
      await ctx.db.patch(args.userId, {
        referralCode,
        updatedAt: Date.now(),
      });
      
      return referralCode;
    }
    
    return null;
  },
});

// Update FCM token for push notifications
export const updateFcmToken = mutation({
  args: {
    fcmToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      fcmToken: args.fcmToken,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Register FCM token for user
export const registerFCMToken = mutation({
  args: {
    userId: v.id("users"),
    fcmToken: v.string(),
    deviceInfo: v.optional(v.object({
      deviceType: v.string(),
      browser: v.string(),
      os: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Store FCM token in user record or separate table
    // For now, we'll add it to the user record
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user with FCM token
    await ctx.db.patch(args.userId, {
      fcmToken: args.fcmToken,
      updatedAt: Date.now(),
    });
    
    console.log(`✅ FCM token registered for user: ${args.userId}`);
    return { success: true };
  },
});