import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Generate unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new login session
export const createLoginSession = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.optional(v.string()),
    loginMethod: v.union(
      v.literal("phone_otp"),
      v.literal("email"),
      v.literal("admin_created"),
      v.literal("social_login")
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    deviceInfo: v.optional(v.object({
      deviceType: v.string(),
      browser: v.string(),
      os: v.string(),
      isMobile: v.boolean(),
    })),
    location: v.optional(v.object({
      country: v.string(),
      city: v.string(),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const sessionId = generateSessionId();
    const loginTime = Date.now();
    
    // Create login session record
    const sessionRecordId = await ctx.db.insert("loginSessions", {
      userId: args.userId,
      studentId: args.studentId,
      sessionId,
      loginTime,
      loginMethod: args.loginMethod,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      deviceInfo: args.deviceInfo,
      location: args.location,
      isActive: true,
      createdAt: loginTime,
      updatedAt: loginTime,
    });
    
    // Update user's login statistics
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        lastLoginTime: loginTime,
        lastActivity: loginTime,
        currentSessionId: sessionId,
        totalLoginSessions: (user.totalLoginSessions || 0) + 1,
        updatedAt: loginTime,
      });
    }
    
    // Log login activity
    await ctx.db.insert("userActivities", {
      userId: args.userId,
      studentId: args.studentId,
      sessionId,
      activityType: "login",
      activityDetails: {
        description: `User logged in via ${args.loginMethod}`,
        metadata: {
          loginMethod: args.loginMethod,
          deviceInfo: args.deviceInfo,
          location: args.location,
        },
      },
      timestamp: loginTime,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });
    
    return { sessionId, sessionRecordId };
  },
});

// End a login session (logout)
export const endLoginSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const logoutTime = Date.now();
    
    // Find the active session
    const session = await ctx.db
      .query("loginSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!session) {
      throw new Error("Active session not found");
    }
    
    const sessionDuration = logoutTime - session.loginTime;
    
    // Update session record
    await ctx.db.patch(session._id, {
      logoutTime,
      sessionDuration,
      isActive: false,
      updatedAt: logoutTime,
    });
    
    // Update user's current session
    const userId = args.userId || session.userId;
    await ctx.db.patch(userId, {
      currentSessionId: undefined,
      lastActivity: logoutTime,
      updatedAt: logoutTime,
    });
    
    // Log logout activity
    await ctx.db.insert("userActivities", {
      userId: session.userId,
      studentId: session.studentId,
      sessionId: args.sessionId,
      activityType: "logout",
      activityDetails: {
        description: `User logged out after ${Math.round(sessionDuration / 1000 / 60)} minutes`,
        metadata: {
          sessionDuration,
          loginTime: session.loginTime,
          logoutTime,
        },
      },
      timestamp: logoutTime,
    });
    
    return { sessionDuration };
  },
});

// Get all login sessions for a user
export const getUserLoginSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loginSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get active sessions
export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("loginSessions")
      .withIndex("by_active_sessions", (q) => q.eq("isActive", true))
      .collect();
    
    // Populate user details
    const sessionsWithUsers = await Promise.all(
      sessions.map(async (session) => {
        const user = await ctx.db.get(session.userId);
        return {
          ...session,
          user,
        };
      })
    );
    
    return sessionsWithUsers;
  },
});

// Get login sessions by student ID
export const getSessionsByStudentId = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loginSessions")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();
  },
});

// Get login statistics
export const getLoginStatistics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = args.endDate || Date.now();
    
    const sessions = await ctx.db
      .query("loginSessions")
      .withIndex("by_login_time")
      .filter((q) => 
        q.and(
          q.gte(q.field("loginTime"), startDate),
          q.lte(q.field("loginTime"), endDate)
        )
      )
      .collect();
    
    const stats = {
      totalLogins: sessions.length,
      uniqueUsers: new Set(sessions.map(s => s.userId)).size,
      averageSessionDuration: sessions
        .filter(s => s.sessionDuration)
        .reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / sessions.filter(s => s.sessionDuration).length || 0,
      loginsByMethod: sessions.reduce((acc, s) => {
        acc[s.loginMethod] = (acc[s.loginMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      loginsByDevice: sessions.reduce((acc, s) => {
        const deviceType = s.deviceInfo?.deviceType || 'unknown';
        acc[deviceType] = (acc[deviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      activeSessions: sessions.filter(s => s.isActive).length,
    };
    
    return stats;
  },
});

// Update session activity (heartbeat)
export const updateSessionActivity = mutation({
  args: {
    sessionId: v.string(),
    activityType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("loginSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!session) {
      return null;
    }
    
    const now = Date.now();
    
    // Update session last activity
    await ctx.db.patch(session._id, {
      updatedAt: now,
    });
    
    // Update user last activity
    if (session.userId) {
      await ctx.db.patch(session.userId, {
        lastActivity: now,
        updatedAt: now,
      });
    }
    
    // Log activity if specified
    if (args.activityType) {
      await ctx.db.insert("userActivities", {
        userId: session.userId,
        studentId: session.studentId,
        sessionId: args.sessionId,
        activityType: args.activityType as any,
        activityDetails: {
          description: `User activity: ${args.activityType}`,
          metadata: args.metadata,
        },
        timestamp: now,
      });
    }
    
    return { updated: true };
  },
});

// Get recent user activities
export const getUserActivities = query({
  args: {
    userId: v.optional(v.id("users")),
    studentId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    if (args.userId) {
      return await ctx.db
        .query("userActivities")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(limit);
    }
    
    if (args.studentId) {
      return await ctx.db
        .query("userActivities")
        .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
        .order("desc")
        .take(limit);
    }
    
    return await ctx.db
      .query("userActivities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// Clean up old sessions (for maintenance)
export const cleanupOldSessions = mutation({
  args: {
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const olderThanDays = args.olderThanDays || 90; // Default 90 days
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldSessions = await ctx.db
      .query("loginSessions")
      .withIndex("by_login_time")
      .filter((q) => q.lt(q.field("loginTime"), cutoffTime))
      .collect();
    
    let deletedCount = 0;
    for (const session of oldSessions) {
      await ctx.db.delete(session._id);
      deletedCount++;
    }
    
    return { deletedSessions: deletedCount };
  },
});