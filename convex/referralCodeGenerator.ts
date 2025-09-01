import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a unique referral code by appending 3 random letters to the Student ID
 * Format: PLYG001ABC, PLYG002XYZ, etc.
 */
export const generateReferralCode = mutation({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
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
    const maxAttempts = 100; // Prevent infinite loops

    // Keep generating until we find a unique code
    while (!isUnique && attempts < maxAttempts) {
      const randomSuffix = generateRandomLetters();
      referralCode = `${args.studentId}${randomSuffix}`;
      
      // Check if this referral code already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
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
  },
});

/**
 * Update existing users to have referral codes
 * This is a one-time migration function
 */
export const migrateUsersToReferralCodes = mutation({
  handler: async (ctx) => {
    // Get all users who have studentId but no referralCode
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

    for (const user of usersWithoutReferralCode) {
      if (user.studentId) {
        try {
          // Generate referral code inline instead of calling the mutation
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
            referralCode = `${user.studentId}${randomSuffix}`;
            
            const existingUser = await ctx.db
              .query("users")
              .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
              .first();
            
            if (!existingUser) {
              isUnique = true;
            }
            
            attempts++;
          }

          if (!isUnique) {
            throw new Error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
          }
          
          await ctx.db.patch(user._id, {
            referralCode: referralCode!,
            updatedAt: Date.now(),
          });
          
          console.log(`Generated referral code ${referralCode!} for user ${user.studentId}`);
        } catch (error) {
          console.error(`Failed to generate referral code for user ${user.studentId}:`, error);
        }
      }
    }

    return {
      processed: usersWithoutReferralCode.length,
      message: `Migration completed for ${usersWithoutReferralCode.length} users`,
    };
  },
});

/**
 * Get referral code by Student ID (for display purposes)
 */
export const getReferralCodeByStudentId = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .first();
    
    return user?.referralCode || null;
  },
});

/**
 * Validate referral code format
 */
export const validateReferralCodeFormat = (referralCode: string): boolean => {
  // Should be in format: PLYG001ABC (studentId + 3 letters)
  const pattern = /^PLYG\d{3}[A-Z]{3}$/;
  return pattern.test(referralCode);
};