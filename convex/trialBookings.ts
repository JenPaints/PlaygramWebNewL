import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new trial booking
export const createTrialBooking = mutation({
  args: {
    phoneNumber: v.string(),
    sport: v.union(v.literal("football"), v.literal("basketball")),
    selectedDate: v.number(), // timestamp
    userDetails: v.object({
      name: v.string(),
      age: v.number(),
      email: v.string(),
      phoneNumber: v.string(),
    }),
    courtLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if phone number already has a trial booking
    const existingBooking = await ctx.db
      .query("trialBookings")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (existingBooking) {
      throw new Error("This phone number has already booked a free trial");
    }

    const bookingId = await ctx.db.insert("trialBookings", {
      phoneNumber: args.phoneNumber,
      sport: args.sport,
      selectedDate: args.selectedDate,
      userDetails: args.userDetails,
      status: "confirmed",
      courtLocation: args.courtLocation || "HSR Football Court, HSR Layout, Bangalore",
      bookingDate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return bookingId;
  },
});

// Check if phone number already has a trial booking
export const checkExistingTrialBooking = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const existingBooking = await ctx.db
      .query("trialBookings")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();
    
    return existingBooking;
  },
});

// Get trial booking by ID
export const getTrialBooking = query({
  args: { bookingId: v.id("trialBookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

// Get all trial bookings by phone number
export const getTrialBookingsByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trialBookings")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();
  },
});

// Get trial bookings by date (for admin/coach view)
export const getTrialBookingsByDate = query({
  args: { 
    startDate: v.number(),
    endDate: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trialBookings")
      .withIndex("by_date", (q) => 
        q.gte("selectedDate", args.startDate).lte("selectedDate", args.endDate)
      )
      .collect();
  },
});

// Get trial bookings by sport and date
export const getTrialBookingsBySportAndDate = query({
  args: { 
    sport: v.union(v.literal("football"), v.literal("basketball")),
    selectedDate: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trialBookings")
      .withIndex("by_sport_date", (q) => 
        q.eq("sport", args.sport).eq("selectedDate", args.selectedDate)
      )
      .collect();
  },
});

// Update trial booking status
export const updateTrialBookingStatus = mutation({
  args: {
    bookingId: v.id("trialBookings"),
    status: v.union(
      v.literal("confirmed"), 
      v.literal("cancelled"), 
      v.literal("completed"),
      v.literal("no-show")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Cancel trial booking
export const cancelTrialBooking = mutation({
  args: {
    bookingId: v.id("trialBookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancellationReason: args.reason,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get all trial bookings (for admin dashboard)
export const getAllTrialBookings = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("confirmed"), 
      v.literal("cancelled"), 
      v.literal("completed"),
      v.literal("no-show")
    )),
  },
  handler: async (ctx, args) => {
    if (args.status !== undefined) {
      const status = args.status as "confirmed" | "cancelled" | "completed" | "no-show";
      const bookings = await ctx.db
        .query("trialBookings")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit || 100);
      return bookings;
    } else {
      const bookings = await ctx.db
        .query("trialBookings")
        .order("desc")
        .take(args.limit || 100);
      return bookings;
    }
  },
});

// Get trial booking statistics
export const getTrialBookingStats = query({
  handler: async (ctx) => {
    const allBookings = await ctx.db.query("trialBookings").collect();
    
    const stats = {
      total: allBookings.length,
      confirmed: allBookings.filter(b => b.status === "confirmed").length,
      completed: allBookings.filter(b => b.status === "completed").length,
      cancelled: allBookings.filter(b => b.status === "cancelled").length,
      noShow: allBookings.filter(b => b.status === "no-show").length,
      byMonth: {} as Record<string, number>,
      bySport: {
        football: allBookings.filter(b => b.sport === "football").length,
        basketball: allBookings.filter(b => b.sport === "basketball").length,
      }
    };
    
    // Group by month
    allBookings.forEach(booking => {
      const date = new Date(booking.selectedDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
    });
    
    return stats;
  },
});