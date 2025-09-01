import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Assign a coach to a batch
export const assignCoachToBatch = mutation({
  args: {
    coachId: v.id("users"),
    batchId: v.id("batches"),
    assignedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify coach exists and has coach role
    const coach = await ctx.db.get(args.coachId);
    if (!coach || coach.userType !== "coach") {
      throw new Error("Invalid coach ID or user is not a coach");
    }

    // Verify batch exists
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Check if assignment already exists
    const existingAssignment = await ctx.db
      .query("coachAssignments")
      .withIndex("by_coach_batch", (q) => 
        q.eq("coachId", args.coachId).eq("batchId", args.batchId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingAssignment) {
      throw new Error("Coach is already assigned to this batch");
    }

    // Create assignment
    const assignmentId = await ctx.db.insert("coachAssignments", {
      coachId: args.coachId,
      batchId: args.batchId,
      assignedBy: args.assignedBy,
      assignedAt: Date.now(),
      isActive: true,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return assignmentId;
  },
});

// Remove coach assignment from batch
export const removeCoachAssignment = mutation({
  args: {
    assignmentId: v.id("coachAssignments"),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await ctx.db.patch(args.assignmentId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get coach's assigned batches
export const getCoachBatches = query({
  args: { coachId: v.id("users") },
  handler: async (ctx, args) => {
    // Get active assignments for the coach
    const assignments = await ctx.db
      .query("coachAssignments")
      .withIndex("by_coach", (q) => q.eq("coachId", args.coachId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const batches = [];
    for (const assignment of assignments) {
      const batch = await ctx.db.get(assignment.batchId);
      if (batch) {
        // Get sport and location details
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        
        // Get enrollments for this batch
        const enrollments = await ctx.db
          .query("userEnrollments")
          .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
          .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
          .collect();

        // Get student details for each enrollment
        const students = [];
        for (const enrollment of enrollments) {
          const student = await ctx.db.get(enrollment.userId);
          if (student) {
            students.push({
              ...enrollment,
              student: {
                _id: student._id,
                name: student.name || student.fullName,
                studentId: student.studentId,
                phone: student.phone,
              },
            });
          }
        }

        batches.push({
          ...batch,
          assignment,
          sport,
          location,
          students,
          totalStudents: students.length,
        });
      }
    }

    return batches;
  },
});

// Mark attendance for a student
export const markAttendance = mutation({
  args: {
    enrollmentId: v.id("userEnrollments"),
    sessionDate: v.number(),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),
    notes: v.optional(v.string()),
    markedBy: v.string(), // Coach ID or name
  },
  handler: async (ctx, args) => {
    // Check if attendance already exists for this date
    const existingAttendance = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_enrollment_date", (q) => 
        q.eq("enrollmentId", args.enrollmentId).eq("sessionDate", args.sessionDate)
      )
      .first();

    if (existingAttendance) {
      // Update existing attendance
      await ctx.db.patch(existingAttendance._id, {
        status: args.status,
        notes: args.notes,
        markedBy: args.markedBy,
      });
      return existingAttendance._id;
    } else {
      // Create new attendance record
      const attendanceId = await ctx.db.insert("attendanceRecords", {
        enrollmentId: args.enrollmentId,
        sessionDate: args.sessionDate,
        status: args.status,
        notes: args.notes,
        markedBy: args.markedBy,
        createdAt: Date.now(),
      });

      // Update sessions attended count if present
      if (args.status === "present") {
        const enrollment = await ctx.db.get(args.enrollmentId);
        if (enrollment) {
          await ctx.db.patch(args.enrollmentId, {
            sessionsAttended: enrollment.sessionsAttended + 1,
            updatedAt: Date.now(),
          });
        }
      }

      return attendanceId;
    }
  },
});

// Get attendance records for a batch on a specific date
export const getBatchAttendance = query({
  args: {
    batchId: v.id("batches"),
    sessionDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all active enrollments for the batch
    const enrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();

    const attendanceData = [];
    for (const enrollment of enrollments) {
      // Get student details
      const student = await ctx.db.get(enrollment.userId);
      
      // Get attendance record for this date
      const attendance = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_enrollment_date", (q) => 
          q.eq("enrollmentId", enrollment._id).eq("sessionDate", args.sessionDate)
        )
        .first();

      if (student) {
        attendanceData.push({
          enrollment,
          student: {
            _id: student._id,
            name: student.name || student.fullName,
            studentId: student.studentId,
            phone: student.phone,
          },
          attendance: attendance || null,
          remainingSessions: enrollment.sessionsTotal - enrollment.sessionsAttended,
          completionPercentage: Math.round((enrollment.sessionsAttended / enrollment.sessionsTotal) * 100),
        });
      }
    }

    return attendanceData;
  },
});

// Get attendance history for a batch across multiple dates
export const getBatchAttendanceHistory = query({
  args: {
    batchId: v.id("batches"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30; // Default to last 30 sessions
    const endDate = args.endDate || Date.now();
    const startDate = args.startDate || (endDate - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

    // Get all enrollments for this batch first
    const batchEnrollments = await ctx.db
      .query("userEnrollments")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .filter((q) => q.eq(q.field("enrollmentStatus"), "active"))
      .collect();

    // Get attendance records for all enrollments in this batch
    const attendanceRecords = [];
    for (const enrollment of batchEnrollments) {
      const records = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
        .filter((q) => 
          q.and(
            q.gte(q.field("sessionDate"), startDate),
            q.lte(q.field("sessionDate"), endDate)
          )
        )
        .collect();
      attendanceRecords.push(...records);
    }
    
    // Sort by date (newest first)
    attendanceRecords.sort((a, b) => b.sessionDate - a.sessionDate);

    // Group by session date
    const sessionMap = new Map();
    
    for (const record of attendanceRecords) {
      const dateKey = new Date(record.sessionDate).toDateString();
      
      if (!sessionMap.has(dateKey)) {
        sessionMap.set(dateKey, {
          sessionDate: record.sessionDate,
          attendanceRecords: [],
          summary: {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0
          }
        });
      }
      
      const session = sessionMap.get(dateKey);
      
      // Get enrollment and student details
      const enrollment = await ctx.db.get(record.enrollmentId);
      if (enrollment) {
        const student = await ctx.db.get(enrollment.userId);
        if (student) {
          session.attendanceRecords.push({
            ...record,
            student: {
              _id: student._id,
              name: student.name || student.fullName,
              studentId: student.studentId,
              phone: student.phone,
            },
            enrollment
          });
          
          // Update summary
          session.summary[record.status]++;
          session.summary.total++;
        }
      }
    }
    
    // Convert map to array and sort by date (newest first)
    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => b.sessionDate - a.sessionDate)
      .slice(0, limit);
    
    return sessions;
  },
});

// Get student progress summary
export const getStudentProgress = query({
  args: { enrollmentId: v.id("userEnrollments") },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const student = await ctx.db.get(enrollment.userId);
    const batch = await ctx.db.get(enrollment.batchId);
    
    // Get attendance records
    const attendanceRecords = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_enrollment", (q) => q.eq("enrollmentId", args.enrollmentId))
      .collect();

    // Calculate attendance statistics
    const totalMarked = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === "present").length;
    const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
    const lateCount = attendanceRecords.filter(r => r.status === "late").length;
    const excusedCount = attendanceRecords.filter(r => r.status === "excused").length;
    
    const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;
    const remainingSessions = enrollment.sessionsTotal - enrollment.sessionsAttended;
    const completionPercentage = Math.round((enrollment.sessionsAttended / enrollment.sessionsTotal) * 100);
    
    // Check if student has completed all sessions
    const isCompleted = enrollment.sessionsAttended >= enrollment.sessionsTotal;
    
    return {
      enrollment,
      student,
      batch,
      progress: {
        sessionsTotal: enrollment.sessionsTotal,
        sessionsAttended: enrollment.sessionsAttended,
        remainingSessions,
        completionPercentage,
        isCompleted,
      },
      attendance: {
        totalMarked,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate,
      },
      recentAttendance: attendanceRecords.slice(-10), // Last 10 records
    };
  },
});

// Get all coaches for admin assignment
export const getAllCoaches = query({
  args: {},
  handler: async (ctx) => {
    const coaches = await ctx.db
      .query("users")
      .withIndex("by_user_type", (q) => q.eq("userType", "coach"))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return coaches.map(coach => ({
      _id: coach._id,
      name: coach.name || coach.fullName,
      email: coach.email,
      phone: coach.phone,
      studentId: coach.studentId,
      createdAt: coach.createdAt,
    }));
  },
});

// Get batch assignments for admin view
export const getBatchAssignments = query({
  args: { batchId: v.optional(v.id("batches")) },
  handler: async (ctx, args) => {
    let assignments;
    
    if (args.batchId) {
      assignments = await ctx.db
        .query("coachAssignments")
        .withIndex("by_batch", (q) => q.eq("batchId", args.batchId!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      assignments = await ctx.db
        .query("coachAssignments")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }

    const assignmentDetails = [];
    for (const assignment of assignments) {
      const coach = await ctx.db.get(assignment.coachId);
      const batch = await ctx.db.get(assignment.batchId);
      const assignedBy = await ctx.db.get(assignment.assignedBy);
      
      if (coach && batch) {
        const sport = await ctx.db.get(batch.sportId);
        const location = await ctx.db.get(batch.locationId);
        
        assignmentDetails.push({
          ...assignment,
          coach: {
            _id: coach._id,
            name: coach.name || coach.fullName,
            email: coach.email,
            phone: coach.phone,
          },
          batch: {
            ...batch,
            sport,
            location,
          },
          assignedBy: {
            _id: assignedBy?._id,
            name: assignedBy?.name || assignedBy?.fullName,
          },
        });
      }
    }

    return assignmentDetails;
  },
});