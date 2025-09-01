import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Clear and regenerate session schedules for an enrollment
export const clearAndRegenerateSessionSchedules = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
  },
  handler: async (ctx, args) => {
    // Get the enrollment details
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Delete all existing session schedules for this enrollment
    const existingSessions = await ctx.db
      .query("sessionSchedules")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .collect();

    for (const session of existingSessions) {
      await ctx.db.delete(session._id);
    }

    // Regenerate session schedules with the correct logic
    await ctx.runMutation(internal.sessionSchedules.generateSessionSchedules, {
      enrollmentId: args.enrollmentId,
      batchId: enrollment.batchId,
      sessionsTotal: enrollment.sessionsTotal,
      startDate: enrollment.startDate,
    });

    return { success: true, message: "Session schedules regenerated successfully" };
  },
});

// Generate session schedules when a user enrolls
export const generateSessionSchedules = internalMutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    batchId: v.id("batches"),
    sessionsTotal: v.number(),
    startDate: v.number(),
  },
  handler: async (ctx, args) => {
    console.log('🔄 Starting session schedule generation for enrollment:', args.enrollmentId);
    console.log('📊 Parameters:', { batchId: args.batchId, sessionsTotal: args.sessionsTotal, startDate: new Date(args.startDate) });

    // Get batch schedule information
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      console.error('❌ Batch not found:', args.batchId);
      throw new Error("Batch not found");
    }

    console.log('✅ Batch found:', { batchId: batch._id, schedule: batch.schedule });

    // Ensure batch has schedule data
    if (!batch.schedule || batch.schedule.length === 0) {
      console.error('❌ Batch has no schedule data:', batch._id);
      throw new Error("Batch has no schedule data");
    }

    const schedules = [];
    let sessionNumber = 1;
    let currentDate = new Date(args.startDate);

    // Generate sessions based on batch schedule
    let weekStartDate = new Date(args.startDate);

    while (sessionNumber <= args.sessionsTotal) {
      // For each day in the batch schedule for this week
      for (const scheduleDay of batch.schedule) {
        if (sessionNumber > args.sessionsTotal) break;

        // Find the day index for this scheduled day
        const dayIndex = getDayIndex(scheduleDay.day);
        if (dayIndex === -1) {
          console.warn(`Invalid day name: ${scheduleDay.day}`);
          continue;
        }

        // Calculate the date for this day in the current week
        const sessionDate = new Date(weekStartDate);
        // Find the first occurrence of this day in the current week
        const weekStartDayIndex = weekStartDate.getDay();
        let daysFromWeekStart = (dayIndex - weekStartDayIndex + 7) % 7;

        // If the day has already passed this week, schedule for next week
        if (daysFromWeekStart === 0 && sessionDate.getTime() < Date.now()) {
          daysFromWeekStart = 7;
        }

        sessionDate.setDate(weekStartDate.getDate() + daysFromWeekStart);

        // Check if session is at least 2 hours in the future for pause capability
        const sessionDateTime = new Date(sessionDate);
        const [hours, minutes] = scheduleDay.startTime.split(':').map(Number);
        sessionDateTime.setHours(hours, minutes, 0, 0);
        const twoHoursBefore = sessionDateTime.getTime() - (2 * 60 * 60 * 1000);
        const canPause = Date.now() < twoHoursBefore;

        console.log(`📅 Creating session ${sessionNumber}:`, {
          date: sessionDate.toDateString(),
          startTime: scheduleDay.startTime,
          endTime: scheduleDay.endTime,
          day: scheduleDay.day
        });

        const scheduleId = await ctx.db.insert("sessionSchedules", {
          enrollmentId: args.enrollmentId,
          batchId: args.batchId,
          sessionNumber,
          scheduledDate: sessionDate.getTime(),
          scheduledStartTime: scheduleDay.startTime,
          scheduledEndTime: scheduleDay.endTime,
          status: "scheduled",
          isPaused: false,
          canPause,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        console.log(`✅ Session ${sessionNumber} created with ID:`, scheduleId);

        schedules.push(scheduleId);
        sessionNumber++;
      }

      // Move to next week after completing all sessions for current week
      weekStartDate.setDate(weekStartDate.getDate() + 7);
    }

    console.log(`🎉 Session generation completed! Created ${schedules.length} sessions for enrollment:`, args.enrollmentId);
    console.log('📋 Session IDs:', schedules);

    return schedules;
  },
});

// Get session schedules for an enrollment
export const getSessionSchedulesByEnrollment = query({
  args: { enrollmentId: v.id("userEnrollments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionSchedules")
      .withIndex("by_enrollment", (q: any) => q.eq("enrollmentId", args.enrollmentId))
      .order("asc")
      .collect();
  },
});

// Get session schedules for a specific date range
export const getSessionSchedulesByDateRange = query({
  args: {
    enrollmentId: v.id("userEnrollments"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const allSchedules = await ctx.db
      .query("sessionSchedules")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .collect();

    return allSchedules.filter(
      (schedule) =>
        schedule.scheduledDate >= args.startDate &&
        schedule.scheduledDate <= args.endDate
    );
  },
});

// Request to pause a session
export const requestSessionPause = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    sessionScheduleId: v.id("sessionSchedules"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the session schedule
    const sessionSchedule = await ctx.db.get(args.sessionScheduleId);
    if (!sessionSchedule) {
      throw new Error("Session schedule not found");
    }

    // Check if session can still be paused (2 hours before)
    const sessionDateTime = new Date(sessionSchedule.scheduledDate);
    const [hours, minutes] = sessionSchedule.scheduledStartTime.split(':').map(Number);
    sessionDateTime.setHours(hours, minutes, 0, 0);
    const twoHoursBefore = sessionDateTime.getTime() - (2 * 60 * 60 * 1000);

    if (Date.now() >= twoHoursBefore) {
      throw new Error("Cannot pause session less than 2 hours before start time");
    }

    // Check how many pauses have been used
    const existingPauses = await ctx.db
      .query("pauseRequests")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    if (existingPauses.length >= 10) {
      throw new Error("Maximum of 10 session pauses allowed per enrollment");
    }

    // Create pause request
    const pauseRequestId = await ctx.db.insert("pauseRequests", {
      enrollmentId: args.enrollmentId,
      sessionScheduleId: args.sessionScheduleId,
      requestedAt: Date.now(),
      sessionDate: sessionSchedule.scheduledDate,
      reason: args.reason,
      status: "approved", // Auto-approve for now
      pausesUsed: existingPauses.length + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update session schedule to paused
    await ctx.db.patch(args.sessionScheduleId, {
      status: "paused",
      isPaused: true,
      pausedAt: Date.now(),
      pausedReason: args.reason,
      canPause: false,
      updatedAt: Date.now(),
    });

    // Find next available session slot to reschedule
    await rescheduleSession(ctx, args.sessionScheduleId, args.enrollmentId);

    return pauseRequestId;
  },
});

// Reschedule a paused session to next available slot
const rescheduleSession = async (
  ctx: any,
  sessionScheduleId: Id<"sessionSchedules">,
  enrollmentId: Id<"userEnrollments">
) => {
  const sessionSchedule = await ctx.db.get(sessionScheduleId);
  if (!sessionSchedule) return;

  const batch = await ctx.db.get(sessionSchedule.batchId);
  if (!batch) return;

  // Get all existing sessions for this enrollment
  const existingSessions = await ctx.db
    .query("sessionSchedules")
    .withIndex("by_enrollment", (q: any) => q.eq("enrollmentId", enrollmentId))
    .collect();

  // Find the last scheduled session date
  const lastSession = existingSessions
    .filter((s: any) => s.status === "scheduled")
    .sort((a: any, b: any) => b.scheduledDate - a.scheduledDate)[0];

  if (!lastSession) return;

  // Find next available slot after the last session
  let nextDate = new Date(lastSession.scheduledDate + 24 * 60 * 60 * 1000);

  // Find next occurrence of any batch schedule day
  for (let i = 0; i < 14; i++) { // Look up to 2 weeks ahead
    const dayName = getDayName(nextDate.getDay());
    const scheduleDay = batch.schedule.find((s: any) => s.day === dayName);

    if (scheduleDay) {
      // Check if this slot is available (no other session scheduled)
      const conflictingSession = existingSessions.find(
        (s: any) => s.scheduledDate === nextDate.getTime() && s.status === "scheduled"
      );

      if (!conflictingSession) {
        // Create new session at this slot
        const sessionDateTime = new Date(nextDate);
        const [hours, minutes] = scheduleDay.startTime.split(':').map(Number);
        sessionDateTime.setHours(hours, minutes, 0, 0);
        const twoHoursBefore = sessionDateTime.getTime() - (2 * 60 * 60 * 1000);
        const canPause = Date.now() < twoHoursBefore;

        await ctx.db.insert("sessionSchedules", {
          enrollmentId,
          batchId: sessionSchedule.batchId,
          sessionNumber: sessionSchedule.sessionNumber,
          scheduledDate: nextDate.getTime(),
          scheduledStartTime: scheduleDay.startTime,
          scheduledEndTime: scheduleDay.endTime,
          status: "scheduled",
          isPaused: false,
          rescheduledFrom: sessionSchedule.scheduledDate,
          canPause,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Update pause request with rescheduled date
        const pauseRequest = await ctx.db
          .query("pauseRequests")
          .withIndex("by_session_schedule", (q: any) => q.eq("sessionScheduleId", sessionScheduleId))
          .first();

        if (pauseRequest) {
          await ctx.db.patch(pauseRequest._id, {
            rescheduledToDate: nextDate.getTime(),
            processedAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        break;
      }
    }

    nextDate.setDate(nextDate.getDate() + 1);
  }
};

// Get pause requests for an enrollment
export const getPauseRequestsByEnrollment = query({
  args: { enrollmentId: v.id("userEnrollments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pauseRequests")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .order("desc")
      .collect();
  },
});

// Helper functions
function getDayIndex(dayName: string): number {
  const normalized = dayName.trim().toLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const index = days.indexOf(normalized);
  if (index === -1) {
    console.warn(`Invalid day name: ${dayName}`);
  }
  return index;
}

function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

// Update session status (for attendance marking)
export const updateSessionStatus = mutation({
  args: {
    sessionScheduleId: v.id("sessionSchedules"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionScheduleId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Generate additional sessions for package upgrades
export const generateAdditionalSessions = internalMutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    batchId: v.id("batches"),
    additionalSessions: v.number(),
    startFromDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get batch schedule information
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Get existing sessions to determine the next session number and last session date
    const existingSessions = await ctx.db
      .query("sessionSchedules")
      .withIndex("by_enrollment", (q: any) => q.eq("enrollmentId", args.enrollmentId))
      .collect();

    const maxSessionNumber = Math.max(...existingSessions.map((s: any) => s.sessionNumber), 0);
    let sessionNumber = maxSessionNumber + 1;

    // Find the last scheduled session date to continue from there
    const lastSessionDate = existingSessions.length > 0
      ? Math.max(...existingSessions.map((s: any) => s.scheduledDate))
      : Date.now();

    const schedules = [];
    let currentDate = new Date(Math.max(lastSessionDate + (24 * 60 * 60 * 1000), Date.now())); // Start from day after last session or today
    let sessionsGenerated = 0;

    console.log(`🔄 Generating ${args.additionalSessions} additional sessions starting from ${currentDate.toDateString()}`);

    // Generate additional sessions based on batch schedule
    while (sessionsGenerated < args.additionalSessions) {
      for (const scheduleDay of batch.schedule) {
        if (sessionsGenerated >= args.additionalSessions) break;

        // Find next occurrence of this day
        const dayIndex = getDayIndex(scheduleDay.day);
        const daysUntilNext = (dayIndex - currentDate.getDay() + 7) % 7;
        const sessionDate = new Date(currentDate);
        sessionDate.setDate(currentDate.getDate() + daysUntilNext);

        // Check if session is at least 2 hours in the future for pause capability
        const sessionDateTime = new Date(sessionDate);
        const [hours, minutes] = scheduleDay.startTime.split(':').map(Number);
        sessionDateTime.setHours(hours, minutes, 0, 0);
        const twoHoursBefore = sessionDateTime.getTime() - (2 * 60 * 60 * 1000);
        const canPause = Date.now() < twoHoursBefore;

        const scheduleId = await ctx.db.insert("sessionSchedules", {
          enrollmentId: args.enrollmentId,
          batchId: args.batchId,
          sessionNumber,
          scheduledDate: sessionDate.getTime(),
          scheduledStartTime: scheduleDay.startTime,
          scheduledEndTime: scheduleDay.endTime,
          status: "scheduled",
          isPaused: false,
          canPause,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        schedules.push(scheduleId);
        sessionNumber++;
        sessionsGenerated++;
        currentDate = new Date(sessionDate.getTime() + 24 * 60 * 60 * 1000); // Move to next day
      }
    }

    return schedules;
  },
});

// Get sessions for calendar view (by user phone)
export const getSessionsForCalendar = query({
  args: {
    phoneNumber: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // First find the user by phone number
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q: any) => q.eq("phone", args.phoneNumber))
      .first();

    if (!user) {
      return [];
    }

    // Get user enrollments using the actual userId
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const allSessions = [];

    for (const enrollment of enrollments) {
      const sessions = await ctx.db
        .query("sessionSchedules")
        .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
        .filter((q) =>
          q.and(
            q.gte(q.field("scheduledDate"), args.startDate),
            q.lte(q.field("scheduledDate"), args.endDate)
          )
        )
        .collect();

      // Add enrollment and batch info to sessions
      for (const session of sessions) {
        const batch = await ctx.db.get(session.batchId);
        const sport = batch ? await ctx.db.get(batch.sportId) : null;

        allSessions.push({
          ...session,
          enrollment,
          batch,
          sport,
        });
      }
    }

    return allSessions;
  },
});