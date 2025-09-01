import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// Fix enrollments that were created without proper batch assignment
export const fixEnrollmentsWithoutBatches = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔧 Fixing enrollments without proper batch assignment...');
    
    // Find enrollments with temp_batch or pending status
    const problematicEnrollments = await ctx.db
      .query("userEnrollments")
      .filter((q) => 
        q.or(
          q.eq(q.field("enrollmentStatus"), "pending"),
          q.eq(q.field("batchId"), "temp_batch" as any)
        )
      )
      .collect();
    
    console.log(`Found ${problematicEnrollments.length} enrollments needing batch assignment`);
    
    if (problematicEnrollments.length === 0) {
      return {
        success: true,
        message: 'No enrollments need fixing',
        fixed: 0
      };
    }
    
    // Get all available batches
    const batches = await ctx.db.query("batches").filter((q) => q.eq(q.field("isActive"), true)).collect();
    
    if (batches.length === 0) {
      console.error('❌ No batches available to assign');
      return {
        success: false,
        error: 'No active batches available',
        fixed: 0
      };
    }
    
    // Get sports programs for mapping
    const sports = await ctx.db.query("sportsPrograms").collect();
    
    let fixed = 0;
    let failed = 0;
    
    for (const enrollment of problematicEnrollments) {
      try {
        console.log(`🔧 Fixing enrollment ${enrollment._id}`);
        
        // Try to find appropriate batch based on package type or use first available
        let assignedBatch = batches.find(batch => 
          batch.currentEnrollments < batch.maxCapacity
        );
        
        if (!assignedBatch) {
          console.error(`❌ No available batch capacity for enrollment ${enrollment._id}`);
          failed++;
          continue;
        }
        
        // Update enrollment with proper batch
        await ctx.db.patch(enrollment._id, {
          batchId: assignedBatch._id,
          enrollmentStatus: "active",
          updatedAt: Date.now(),
        });
        
        // Update batch enrollment count
        await ctx.db.patch(assignedBatch._id, {
          currentEnrollments: assignedBatch.currentEnrollments + 1,
          updatedAt: Date.now(),
        });
        
        // Generate sessions for this enrollment
        try {
          await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
            enrollmentId: enrollment._id,
            batchId: assignedBatch._id,
            sessionsTotal: enrollment.sessionsTotal,
            startDate: enrollment.startDate,
          });
          
          console.log(`✅ Generated sessions for enrollment ${enrollment._id}`);
          fixed++;
        } catch (sessionError: any) {
          console.error(`❌ Failed to generate sessions for enrollment ${enrollment._id}:`, sessionError);
          // Continue with batch assignment even if session generation fails
          fixed++;
        }
        
      } catch (error: any) {
        console.error(`❌ Failed to fix enrollment ${enrollment._id}:`, error);
        failed++;
      }
    }
    
    console.log(`🎉 Fix completed! Fixed: ${fixed}, Failed: ${failed}`);
    
    return {
      success: true,
      message: `Fixed ${fixed} enrollments, ${failed} failed`,
      fixed,
      failed,
      totalProcessed: problematicEnrollments.length
    };
  },
});

// Create basic sports and batches if none exist
export const createBasicSetup = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🏗️ Creating basic sports and batch setup...');
    
    const timestamp = Date.now();
    
    // Check if sports exist
    const existingSports = await ctx.db.query("sportsPrograms").collect();
    if (existingSports.length === 0) {
      console.log('Creating basic sports programs...');
      
      const footballSportId = await ctx.db.insert("sportsPrograms", {
        name: "Football",
        description: "Football coaching program",
        category: "Team Sports",
        imageUrl: "/images/football.jpg",
        ageGroups: ["All Ages"],
        skillLevels: ["Beginner", "Intermediate", "Advanced"],
        equipment: ["Football", "Cones"],
        benefits: ["Fitness", "Teamwork"],
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      console.log('✅ Created football sport program');
    }
    
    // Check if locations exist
    const existingLocations = await ctx.db.query("locations").collect();
    if (existingLocations.length === 0) {
      console.log('Creating basic location...');
      
      const locationId = await ctx.db.insert("locations", {
        name: "Main Ground",
        address: "HSR Layout, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560102",
        latitude: 12.9121,
        longitude: 77.6446,
        facilities: ["Football Field", "Changing Rooms"],
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      console.log('✅ Created main location');
    }
    
    // Check if batches exist
    const existingBatches = await ctx.db.query("batches").collect();
    if (existingBatches.length === 0) {
      console.log('Creating basic batch...');
      
      const sports = await ctx.db.query("sportsPrograms").collect();
      const locations = await ctx.db.query("locations").collect();
      
      if (sports.length > 0 && locations.length > 0) {
        const batchId = await ctx.db.insert("batches", {
          sportId: sports[0]._id,
          locationId: locations[0]._id,
          name: "General Batch 1",
          description: "General coaching batch",
          coachName: "Coach Playgram",
          ageGroup: "All Ages",
          skillLevel: "All Levels",
          maxCapacity: 20,
          currentEnrollments: 0,
          schedule: [
            { day: "Monday", startTime: "18:00", endTime: "19:30" },
            { day: "Wednesday", startTime: "18:00", endTime: "19:30" },
            { day: "Friday", startTime: "18:00", endTime: "19:30" }
          ],
          packages: [
            {
              duration: "1 Month",
              price: 2999,
              sessions: 12,
              features: ["Professional Coaching", "Equipment Provided"]
            }
          ],
          startDate: timestamp,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        
        console.log('✅ Created basic batch');
      }
    }
    
    return {
      success: true,
      message: 'Basic setup completed'
    };
  },
});

// Get enrollments that need fixing
export const getProblematicEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const problematicEnrollments = await ctx.db
      .query("userEnrollments")
      .filter((q) => 
        q.or(
          q.eq(q.field("enrollmentStatus"), "pending"),
          q.eq(q.field("batchId"), "temp_batch" as any)
        )
      )
      .collect();
    
    const results = [];
    
    for (const enrollment of problematicEnrollments) {
      // Check if enrollment has sessions
      const sessions = await ctx.db
        .query("sessionSchedules")
        .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
        .collect();
      
      results.push({
        ...enrollment,
        sessionCount: sessions.length,
        needsSessionGeneration: sessions.length === 0
      });
    }
    
    return results;
  },
});

// Fix user enrollments without sessions
export const fixUserEnrollmentsWithoutSessions = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔧 Fixing user enrollments without sessions...');
    
    const enrollments = await ctx.db
      .query("userEnrollments")
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();
    
    let fixed = 0;
    let failed = 0;
    
    for (const enrollment of enrollments) {
      try {
        const sessions = await ctx.db
          .query("sessionSchedules")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();
        
        if (sessions.length === 0 && enrollment.batchId && enrollment.batchId !== "temp_batch") {
          await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
            enrollmentId: enrollment._id,
            batchId: enrollment.batchId,
            sessionsTotal: enrollment.sessionsTotal,
            startDate: enrollment.startDate,
          });
          
          console.log(`✅ Generated sessions for enrollment ${enrollment._id}`);
          fixed++;
        }
      } catch (error) {
        console.error(`❌ Failed to generate sessions for enrollment ${enrollment._id}:`, error);
        failed++;
      }
    }
    
    console.log(`🎉 Fix completed! Fixed: ${fixed}, Failed: ${failed}`);
    
    return {
      success: true,
      message: `Fixed ${fixed} enrollments, ${failed} failed`,
      fixed,
      failed,
      totalProcessed: enrollments.length
    };
  },
});

// Migrate legacy enrollments to userEnrollments
export const migrateLegacyEnrollments = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Migrating legacy enrollments...');
    
    const legacyEnrollments = await ctx.db
      .query("enrollments")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    let migrated = 0;
    let failed = 0;
    
    for (const legacy of legacyEnrollments) {
      try {
        // Find or create user
        let user = await ctx.db
  .query("users")
  .withIndex("by_phone", (q) => q.eq("phone", legacy.phoneNumber))
  .first();

if (!user) {
  const userId = await ctx.db.insert("users", {
    phone: legacy.phoneNumber,
    userType: "student",
    status: "active",
    createdAt: legacy.createdAt || Date.now(),
    updatedAt: Date.now(),
  });
  user = await ctx.db.get(userId);
}

if (!user) throw new Error("Failed to create or find user");

// Find suitable batch (simplified: use first active batch)
const batches = await ctx.db.query("batches").filter((q) => q.eq(q.field("isActive"), true)).collect();
const batch = batches[0];
if (!batch) throw new Error("No active batch found");

// Check if userEnrollment already exists
const existing = await ctx.db
  .query("userEnrollments")
  .withIndex("by_user_batch", (q) => q.eq("userId", user._id).eq("batchId", batch._id))
  .first();

if (existing) continue;

// Create userEnrollment
const enrollmentId = await ctx.db.insert("userEnrollments", {
  userId: user._id,
  batchId: batch._id,
  packageType: legacy.planId,
  packageDuration: legacy.planDuration || "1-month",
  sessionsTotal: 12, // Default or calculate based on plan
  startDate: legacy.sessionStartDate || Date.now(),
  endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
  paymentAmount: legacy.paymentAmount || 0,
  razorpayOrderId: legacy.orderId,
  notes: `Migrated from legacy enrollment ${legacy._id}`,
  sessionsAttended: 0,
  paymentStatus: "paid",
  enrollmentStatus: "active",
  createdAt: legacy.createdAt || Date.now(),
  updatedAt: Date.now(),
});

// Generate sessions
await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
  enrollmentId,
  batchId: batch._id,
  sessionsTotal: 12,
  startDate: legacy.sessionStartDate || Date.now(),
});

// Optionally update legacy enrollment
// Removed invalid status update

migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate ${legacy._id}:`, error);
        failed++;
      }
    }
    
    return { success: true, migrated, failed, total: legacyEnrollments.length };
  },
});