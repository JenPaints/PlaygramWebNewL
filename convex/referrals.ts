import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Referral Settings Management
export const createOrUpdateReferralSetting = mutation({
  args: {
    packageDuration: v.string(),
    rewardSessions: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Check if setting already exists for this package
    const existingSetting = await ctx.db
      .query("referralSettings")
      .withIndex("by_package", (q) => q.eq("packageDuration", args.packageDuration))
      .first();
    
    if (existingSetting) {
      // Update existing setting
      await ctx.db.patch(existingSetting._id, {
        rewardSessions: args.rewardSessions,
        isActive: args.isActive,
        updatedAt: timestamp,
      });
      return existingSetting._id;
    } else {
      // Create new setting
      return await ctx.db.insert("referralSettings", {
        packageDuration: args.packageDuration,
        rewardSessions: args.rewardSessions,
        isActive: args.isActive,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  },
});

export const getReferralSettings = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("referralSettings")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getAllReferralSettings = query({
  handler: async (ctx) => {
    return await ctx.db.query("referralSettings").collect();
  },
});

// Referral Code Validation
export const validateReferralCode = query({
  args: {
    referralCode: v.string(),
    currentUserPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find user with this referral code
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();
    
    if (!referrer) {
      return { valid: false, message: "Invalid referral code" };
    }
    
    // Check if user is trying to use their own referral code
    if (args.currentUserPhone && referrer.phone === args.currentUserPhone) {
      return { valid: false, message: "You cannot use your own referral code" };
    }
    
    // Check if this phone number has already used this referral code
    if (args.currentUserPhone) {
      const existingReferral = await ctx.db
        .query("referrals")
        .withIndex("by_referred_phone", (q) => q.eq("referredPhone", args.currentUserPhone!))
        .filter((q) => q.eq(q.field("referralCode"), args.referralCode))
        .first();
      
      if (existingReferral) {
        return { valid: false, message: "You have already used this referral code" };
      }
    }
    
    return {
      valid: true,
      referrer: {
        _id: referrer._id,
        studentId: referrer.studentId,
        referralCode: referrer.referralCode,
        fullName: referrer.fullName || referrer.name,
        phone: referrer.phone,
      },
    };
  },
});

// Create Referral Record
export const createReferral = mutation({
  args: {
    referralCode: v.string(),
    referredPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Validate referral code
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();
    
    if (!referrer) {
      throw new Error("Invalid referral code");
    }
    
    // Prevent self-referrals
    if (referrer.phone === args.referredPhone) {
      throw new Error("You cannot use your own referral code");
    }
    
    // Check if this phone number already used this referral code
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_phone", (q) => q.eq("referredPhone", args.referredPhone))
      .filter((q) => q.eq(q.field("referralCode"), args.referralCode))
      .first();
    
    if (existingReferral) {
      throw new Error("You have already used this referral code");
    }
    
    // Create new referral record
    return await ctx.db.insert("referrals", {
      referrerStudentId: referrer.studentId || referrer.referralCode || args.referralCode, // Use studentId if available, fallback to referralCode, then args.referralCode
      referrerUserId: referrer._id,
      referredPhone: args.referredPhone,
      referralCode: args.referralCode,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

// Process Referral Reward
export const processReferralReward = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    referredPhone: v.string(),
    packageDuration: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Find pending referral for this phone number
    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_phone", (q) => q.eq("referredPhone", args.referredPhone))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
    
    if (!referral) {
      console.log("No pending referral found for phone:", args.referredPhone);
      return null;
    }
    
    // Get referral settings for this package
    const referralSetting = await ctx.db
      .query("referralSettings")
      .withIndex("by_package", (q) => q.eq("packageDuration", args.packageDuration))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!referralSetting) {
      console.log("No active referral setting found for package:", args.packageDuration);
      return null;
    }
    
    // Update referral status
    await ctx.db.patch(referral._id, {
      status: "completed",
      enrollmentId: args.enrollmentId,
      packageDuration: args.packageDuration,
      rewardSessions: referralSetting.rewardSessions,
      updatedAt: timestamp,
    });
    
    // Create reward record
    const rewardId = await ctx.db.insert("referralRewards", {
      referralId: referral._id,
      referrerUserId: referral.referrerUserId,
      referrerStudentId: referral.referrerStudentId,
      rewardType: "free_sessions",
      rewardValue: referralSetting.rewardSessions,
      rewardStatus: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    
    // Apply reward to referrer's next enrollment or existing active enrollment
    await applyReferralReward(ctx, rewardId);
    
    return {
      referralId: referral._id,
      rewardId,
      rewardSessions: referralSetting.rewardSessions,
    };
  },
});

// Apply Referral Reward
const applyReferralReward = async (ctx: any, rewardId: any) => {
  const reward = await ctx.db.get(rewardId);
  if (!reward) return;
  
  // Find referrer's most recent active enrollment
  const referrerEnrollments = await ctx.db
    .query("userEnrollments")
    .filter((q: any) => q.eq(q.field("userId"), reward.referrerUserId))
    .filter((q: any) => q.eq(q.field("enrollmentStatus"), "active"))
    .collect();
  
  if (referrerEnrollments.length > 0) {
    // Apply to most recent enrollment
    const latestEnrollment = referrerEnrollments.sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
    
    await ctx.db.patch(latestEnrollment._id, {
      sessionsTotal: latestEnrollment.sessionsTotal + reward.rewardValue,
      updatedAt: Date.now(),
    });
    
    await ctx.db.patch(rewardId, {
      rewardStatus: "applied",
      appliedToEnrollmentId: latestEnrollment._id,
      updatedAt: Date.now(),
    });
    
    console.log(`Applied ${reward.rewardValue} free sessions to enrollment ${latestEnrollment._id}`);
  } else {
    console.log(`No active enrollment found for referrer ${reward.referrerStudentId}. Reward will be applied to next enrollment.`);
  }
};

// Get Referral Statistics
export const getReferralStats = query({
  args: {
    studentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let referrals;
    
    if (args.studentId) {
      // Get stats for specific student
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_referrer_student_id", (q) => q.eq("referrerStudentId", args.studentId!))
        .collect();
    } else {
      // Get all referrals for admin
      referrals = await ctx.db.query("referrals").collect();
    }
    
    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === "pending").length,
      completedReferrals: referrals.filter(r => r.status === "completed").length,
      rewardedReferrals: referrals.filter(r => r.status === "rewarded").length,
      totalSessionsEarned: referrals.reduce((sum, r) => sum + (r.rewardSessions || 0), 0),
    };
    
    return { stats, referrals };
  },
});

// Get User's Referral Rewards
export const getUserReferralRewards = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referralRewards")
      .withIndex("by_referrer_user_id", (q) => q.eq("referrerUserId", args.userId))
      .collect();
  },
});

// Update Referred User ID
export const updateReferredUserId = mutation({
  args: {
    referredPhone: v.string(),
    referredUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referred_phone", (q) => q.eq("referredPhone", args.referredPhone))
      .collect();
    
    for (const referral of referrals) {
      await ctx.db.patch(referral._id, {
        referredUserId: args.referredUserId,
        updatedAt: Date.now(),
      });
    }
    
    return referrals.length;
  },
});