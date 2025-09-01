import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { assignStudentId } from "./studentIdGenerator";
import { createLoginSession } from "./loginSessions";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Phone number authentication functions
export const createPhoneUser = mutation({
  args: {
    phoneNumber: v.string(),
    enrollmentId: v.string(),
    temporaryPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists with this phone number
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("phone"), args.phoneNumber))
      .first();

    if (existingUser) {
      // Update existing user with new enrollment
      await ctx.db.patch(existingUser._id, {
        enrollmentId: args.enrollmentId,
        lastLogin: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user with phone number
    const userId = await ctx.db.insert("users", {
      phone: args.phoneNumber,
      enrollmentId: args.enrollmentId,
      temporaryPassword: args.temporaryPassword,
      isTemporaryPassword: true,
      userType: "student",
      status: "active",
      createdAt: Date.now(),
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const authenticateWithPhone = mutation({
  args: {
    phoneNumber: v.string(),
    enrollmentId: v.string(),
    temporaryPassword: v.string(),
    deviceInfo: v.optional(v.object({
      deviceType: v.string(),
      browser: v.string(),
      os: v.string(),
      isMobile: v.boolean(),
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    location: v.optional(v.object({
      country: v.string(),
      city: v.string(),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("phone"), args.phoneNumber))
      .first();

    let userId: Id<"users">;
    let isNewUser = false;
    let studentId: string | undefined;

    if (existingUser) {
      // Update existing user with enrollment info
      await ctx.db.patch(existingUser._id, {
        enrollmentId: args.enrollmentId,
        temporaryPassword: args.temporaryPassword,
        isTemporaryPassword: true,
        lastLogin: now,
        lastLoginTime: now,
        lastActivity: now,
        totalLoginSessions: (existingUser.totalLoginSessions || 0) + 1,
        updatedAt: now,
      });
      userId = existingUser._id;
      studentId = existingUser.studentId;
    } else {
      // Create new user
      userId = await ctx.db.insert("users", {
        phone: args.phoneNumber,
        enrollmentId: args.enrollmentId,
        temporaryPassword: args.temporaryPassword,
        isTemporaryPassword: true,
        userType: "student",
        status: "active",
        registrationSource: "trial_booking",
        totalLoginSessions: 1,
        createdAt: now,
        lastLogin: now,
        lastLoginTime: now,
        lastActivity: now,
        updatedAt: now,
      });
      isNewUser = true;
    }

    // Assign student ID if not exists
    if (!studentId) {
      // Generate unique student ID inline
      const prefix = "PLYG";
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      let newStudentId = `${prefix}${timestamp}${random}`;
      
      // Check uniqueness
      let attempts = 0;
      while (attempts < 10) {
        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_student_id", (q) => q.eq("studentId", newStudentId))
          .first();
        
        if (!existingUser) {
          break;
        }
        
        attempts++;
        const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        newStudentId = `${prefix}${timestamp}${newRandom}`;
      }
      
      // Update user with student ID
      await ctx.db.patch(userId, {
        studentId: newStudentId,
        updatedAt: now,
      });
      
      studentId = newStudentId;
    }

    // Create login session inline
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await ctx.db.insert("loginSessions", {
      userId,
      studentId,
      sessionId,
      loginTime: now,
      loginMethod: "phone_otp",
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      deviceInfo: args.deviceInfo,
      location: args.location,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    // Log login activity
    await ctx.db.insert("userActivities", {
      userId,
      studentId,
      sessionId,
      activityType: "login",
      activityDetails: {
        description: `User logged in via phone_otp`,
        metadata: {
          loginMethod: "phone_otp",
          deviceInfo: args.deviceInfo,
          location: args.location,
        },
      },
      timestamp: now,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });

    return { 
       userId, 
       isNewUser, 
       studentId,
       sessionId,
     };
  },
});

export const updatePassword = mutation({
  args: {
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      password: args.newPassword,
      temporaryPassword: undefined,
      isTemporaryPassword: false,
      passwordUpdatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getUserByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("phone"), args.phoneNumber))
      .first();
  },
});

// Complete login flow - creates/updates user, assigns student ID, tracks login
export const handleUserLogin = mutation({
  args: {
    phoneNumber: v.string(),
    deviceInfo: v.optional(v.object({
      deviceType: v.string(),
      browser: v.string(),
      os: v.string(),
      isMobile: v.boolean(),
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    location: v.optional(v.object({
      country: v.string(),
      city: v.string(),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user exists
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("phone"), args.phoneNumber))
      .first();
    
    let isFirstTimeLogin = false;
    
    if (!user) {
      // Create new user for first-time login
      isFirstTimeLogin = true;
      const userId = await ctx.db.insert("users", {
         phone: args.phoneNumber,
         userType: "student",
         status: "active",
         registrationSource: "self_registration",
         totalEnrollments: 0,
         totalSessions: 0,
         totalLoginSessions: 1,
         createdAt: now,
         lastLoginTime: now,
         lastActivity: now,
         updatedAt: now,
       });
       
       // Assign student ID for new user
       try {
         // Generate unique student ID directly
         const studentIdCount = await ctx.db.query("users")
           .filter((q) => q.neq(q.field("studentId"), undefined))
           .collect();
         const nextNumber = studentIdCount.length + 1;
         const studentId = `PLYG${nextNumber.toString().padStart(3, '0')}`;
         
         await ctx.db.patch(userId, { studentId });
         console.log('Student ID assigned:', studentId);
       } catch (error) {
         console.error('Error assigning student ID:', error);
       }
       
       // Get the created user
       user = await ctx.db.get(userId);
     } else {
       // Update existing user's login info and ensure userType is set
       const updateData: any = {
         lastLoginTime: now,
         lastActivity: now,
         totalLoginSessions: (user.totalLoginSessions || 0) + 1,
         updatedAt: now,
       };
       
       // Set default userType if not already set
       if (!user.userType) {
         updateData.userType = "student";
       }
       
       // Set default status if not already set
       if (!user.status) {
         updateData.status = "active";
       }
       
       // Initialize enrollment counts if not set
       if (user.totalEnrollments === undefined) {
         updateData.totalEnrollments = 0;
       }
       if (user.totalSessions === undefined) {
         updateData.totalSessions = 0;
       }
       
       await ctx.db.patch(user._id, updateData);
       
       // Get updated user
       user = await ctx.db.get(user._id);
     }
     
     // Create login session for tracking
      try {
        const sessionIdString = `session_${user!._id}_${now}`;
        const sessionId = await ctx.db.insert("loginSessions", {
          userId: user!._id,
          studentId: user!.studentId,
          sessionId: sessionIdString,
          loginTime: now,
          loginMethod: "phone_otp",
          deviceInfo: args.deviceInfo,
          ipAddress: args.ipAddress,
          userAgent: args.userAgent,
          location: args.location,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        console.log('Login session created:', sessionId);
      } catch (error) {
        console.error('Error creating login session:', error);
      }
    
    return {
      user,
      isFirstTimeLogin,
      loginTime: now,
    };
  },
});

// Create new user (admin function)
export const createUser = mutation({
  args: {
    phone: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    fullName: v.optional(v.string()),
    userType: v.optional(v.string()),
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.string()),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    
    if (existingUser) {
      throw new Error("User with this phone number already exists");
    }
    
    const userId = await ctx.db.insert("users", {
      phone: args.phone,
      email: args.email,
      name: args.name,
      fullName: args.fullName,
      userType: args.userType as any,
      status: args.status as any,
      city: args.city,
      state: args.state,
      pincode: args.pincode,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      emergencyContact: args.emergencyContact,
      registrationSource: "admin_created",
      totalEnrollments: 0,
      totalSessions: 0,
      totalLoginSessions: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return { userId };
  },
});

// Update user (admin function)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    fullName: v.optional(v.string()),
    userType: v.optional(v.string()),
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.string()),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, ...updateData } = args;
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if phone number is being changed and if it conflicts
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", updateData.phone))
        .first();
      
      if (existingUser && existingUser._id !== userId) {
        throw new Error("Phone number already in use by another user");
      }
    }
    
    await ctx.db.patch(userId, {
      ...updateData,
      userType: updateData.userType as any,
      status: updateData.status as any,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete user (admin function)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // TODO: Add checks for related data (enrollments, sessions, etc.)
    // For now, we'll just delete the user
    await ctx.db.delete(args.userId);
    
    return { success: true };
  },
});

export const getUserEnrollments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.phone) {
      return [];
    }

    // Get all enrollments for this user's phone number
    return await ctx.db
      .query("enrollments")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", user.phone!))
      .collect();
  },
});
