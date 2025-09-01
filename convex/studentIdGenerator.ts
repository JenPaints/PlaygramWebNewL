import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Generate unique student ID in PLYG123 format
function generateStudentId(): string {
  const prefix = "PLYG";
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// Generate and assign student ID to user
export const assignStudentId = mutation({
  args: {
    userId: v.id("users"),
    forceRegenerate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if user already has a student ID and we're not forcing regeneration
    if (user.studentId && !args.forceRegenerate) {
      return { studentId: user.studentId, isNew: false };
    }
    
    let studentId: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Generate unique student ID
    do {
      studentId = generateStudentId();
      attempts++;
      
      // Check if this ID already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_student_id", (q) => q.eq("studentId", studentId))
        .first();
      
      if (!existingUser) {
        break; // ID is unique
      }
      
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique student ID after multiple attempts");
      }
    } while (true);
    
    // Update user with student ID
    await ctx.db.patch(args.userId, {
      studentId,
      updatedAt: Date.now(),
    });
    
    return { studentId, isNew: true };
  },
});

// Get user by student ID
export const getUserByStudentId = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

// Validate student ID format
export const validateStudentId = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const studentIdRegex = /^PLYG\d{9}$/;
    const isValidFormat = studentIdRegex.test(args.studentId);
    
    if (!isValidFormat) {
      return { isValid: false, reason: "Invalid format. Expected PLYG followed by 9 digits." };
    }
    
    // Check if ID exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .first();
    
    return {
      isValid: true,
      exists: !!existingUser,
      user: existingUser,
    };
  },
});

// Get all users with student IDs
export const getAllStudents = query({
  args: {
    limit: v.optional(v.number()),
    userType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    let query = ctx.db.query("users");
    
    // Filter by user type if specified
    if (args.userType) {
      query = query.filter((q) => q.eq(q.field("userType"), args.userType));
    }
    
    // Filter by status if specified
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    // Only get users with student IDs
    const users = await query
      .filter((q) => q.neq(q.field("studentId"), undefined))
      .order("desc")
      .take(limit);
    
    return users;
  },
});

// Generate student ID statistics
export const getStudentIdStatistics = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    const stats = {
      totalUsers: allUsers.length,
      usersWithStudentId: allUsers.filter(u => u.studentId).length,
      usersWithoutStudentId: allUsers.filter(u => !u.studentId).length,
      studentsByType: allUsers.reduce((acc, user) => {
        if (user.studentId && user.userType) {
          acc[user.userType] = (acc[user.userType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      studentsByStatus: allUsers.reduce((acc, user) => {
        if (user.studentId && user.status) {
          acc[user.status] = (acc[user.status] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      recentStudentIds: allUsers
        .filter(u => u.studentId && u.createdAt)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 10)
        .map(u => ({
          studentId: u.studentId,
          createdAt: u.createdAt,
          userType: u.userType,
          phone: u.phone,
        })),
    };
    
    return stats;
  },
});

// Bulk assign student IDs to users without them
export const bulkAssignStudentIds = mutation({
  args: {
    userType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db.query("users")
      .filter((q) => q.eq(q.field("studentId"), undefined));
    
    if (args.userType) {
      query = query.filter((q) => q.eq(q.field("userType"), args.userType));
    }
    
    const usersWithoutIds = await query.take(limit);
    
    const results = [];
    
    for (const user of usersWithoutIds) {
      try {
        // Generate unique student ID inline
        let studentId: string;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
          studentId = generateStudentId();
          attempts++;
          
          const existingUser = await ctx.db
            .query("users")
            .withIndex("by_student_id", (q) => q.eq("studentId", studentId))
            .first();
          
          if (!existingUser) {
            break;
          }
          
          if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique student ID");
          }
        } while (true);
        
        // Update user with student ID
        await ctx.db.patch(user._id, {
          studentId,
          updatedAt: Date.now(),
        });
        
        results.push({
          userId: user._id,
          phone: user.phone,
          studentId,
          success: true,
        });
      } catch (error) {
        results.push({
          userId: user._id,
          phone: user.phone,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        });
      }
    }
    
    return {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  },
});

// Search students by various criteria
export const searchStudents = query({
  args: {
    searchTerm: v.string(),
    searchType: v.optional(v.union(
      v.literal("studentId"),
      v.literal("phone"),
      v.literal("name"),
      v.literal("email")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchTerm = args.searchTerm.toLowerCase();
    
    if (args.searchType === "studentId") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_student_id", (q) => q.eq("studentId", args.searchTerm.toUpperCase()))
        .first();
      return user ? [user] : [];
    }
    
    if (args.searchType === "phone") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.searchTerm))
        .first();
      return user ? [user] : [];
    }
    
    if (args.searchType === "email") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.searchTerm))
        .first();
      return user ? [user] : [];
    }
    
    // General search across multiple fields
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("studentId"), undefined))
      .collect();
    
    const matchingUsers = allUsers.filter(user => {
      const matchFields = [
        user.studentId?.toLowerCase(),
        user.phone?.toLowerCase(),
        user.name?.toLowerCase(),
        user.fullName?.toLowerCase(),
        user.email?.toLowerCase(),
      ].filter(Boolean);
      
      return matchFields.some(field => field?.includes(searchTerm));
    });
    
    return matchingUsers.slice(0, limit);
  },
});

// Fix duplicate student IDs
export const fixDuplicateStudentIds = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔍 Checking for duplicate student IDs...');
    
    // Get all users with student IDs
    const allUsers = await ctx.db.query("users")
      .filter((q) => q.neq(q.field("studentId"), undefined))
      .collect();
    
    // Group users by student ID
    const studentIdGroups = new Map<string, typeof allUsers>();
    
    for (const user of allUsers) {
      if (user.studentId) {
        if (!studentIdGroups.has(user.studentId)) {
          studentIdGroups.set(user.studentId, []);
        }
        studentIdGroups.get(user.studentId)!.push(user);
      }
    }
    
    // Find duplicates
    const duplicates = Array.from(studentIdGroups.entries())
      .filter(([_, users]) => users.length > 1);
    
    console.log(`Found ${duplicates.length} duplicate student IDs`);
    
    const fixedUsers = [];
    
    // Fix duplicates by keeping the oldest user and reassigning IDs to others
    for (const [duplicateId, users] of duplicates) {
      // Sort by creation date, keep the oldest
      const sortedUsers = users.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      const keepUser = sortedUsers[0];
      const reassignUsers = sortedUsers.slice(1);
      
      console.log(`Duplicate ID ${duplicateId}: keeping user ${keepUser._id}, reassigning ${reassignUsers.length} others`);
      
      // Reassign student IDs to duplicate users
      for (const user of reassignUsers) {
        let newStudentId: string;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
          newStudentId = generateStudentId();
          attempts++;
          
          const existingUser = await ctx.db
            .query("users")
            .withIndex("by_student_id", (q) => q.eq("studentId", newStudentId))
            .first();
          
          if (!existingUser) {
            break;
          }
          
          if (attempts >= maxAttempts) {
            throw new Error(`Failed to generate unique student ID for user ${user._id}`);
          }
        } while (true);
        
        await ctx.db.patch(user._id, {
          studentId: newStudentId,
          updatedAt: Date.now(),
        });
        
        fixedUsers.push({
          userId: user._id,
          phone: user.phone,
          oldStudentId: duplicateId,
          newStudentId,
        });
        
        console.log(`✅ Fixed user ${user._id}: ${duplicateId} → ${newStudentId}`);
      }
    }
    
    return {
      duplicatesFound: duplicates.length,
      usersFixed: fixedUsers.length,
      fixedUsers,
    };
  },
});