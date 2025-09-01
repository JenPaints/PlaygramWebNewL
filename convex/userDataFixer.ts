import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fix user enrollment counts by counting actual enrollments
export const fixUserEnrollmentCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let fixedCount = 0;
    
    for (const user of users) {
      if (!user.phone) continue;
      
      // Count actual enrollments for this user
      const enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_phone", (q) => q.eq("phoneNumber", user.phone!))
        .collect();
      
      const actualEnrollmentCount = enrollments.length;
      
      // Update if count is different or missing
      if (user.totalEnrollments !== actualEnrollmentCount) {
        await ctx.db.patch(user._id, {
          totalEnrollments: actualEnrollmentCount,
          updatedAt: Date.now(),
        });
        fixedCount++;
      }
    }
    
    return { fixedCount, totalUsers: users.length };
  },
});

// Fix user types and statuses for existing users
export const fixUserTypesAndStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let fixedCount = 0;
    
    for (const user of users) {
      const updateData: any = {};
      
      // Set default userType if missing
      if (!user.userType) {
        updateData.userType = "student";
      }
      
      // Set default status if missing
      if (!user.status) {
        updateData.status = "active";
      }
      
      // Initialize counts if missing
      if (user.totalEnrollments === undefined) {
        updateData.totalEnrollments = 0;
      }
      if (user.totalSessions === undefined) {
        updateData.totalSessions = 0;
      }
      if (user.totalLoginSessions === undefined) {
        updateData.totalLoginSessions = 0;
      }
      
      // Update if there are changes
      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = Date.now();
        await ctx.db.patch(user._id, updateData);
        fixedCount++;
      }
    }
    
    return { fixedCount, totalUsers: users.length };
  },
});

// Get users with missing data for debugging
export const getUsersWithMissingData = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const usersWithMissingData = users.filter(user => 
      !user.userType || 
      !user.status || 
      user.totalEnrollments === undefined ||
      user.totalSessions === undefined ||
      user.totalLoginSessions === undefined
    );
    
    return usersWithMissingData.map(user => ({
      _id: user._id,
      phone: user.phone,
      studentId: user.studentId,
      userType: user.userType,
      status: user.status,
      totalEnrollments: user.totalEnrollments,
      totalSessions: user.totalSessions,
      totalLoginSessions: user.totalLoginSessions,
    }));
  },
});