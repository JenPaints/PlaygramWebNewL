import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllBookings = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    
    // Get sport details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const sport = await ctx.db.get(booking.sportId);
        return {
          ...booking,
          sport,
        };
      })
    );

    return bookingsWithDetails;
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    return await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
  },
});

export const scheduleBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    scheduledDate: v.number(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    return await ctx.db.patch(args.bookingId, {
      scheduledDate: args.scheduledDate,
      status: "confirmed",
    });
  },
});
