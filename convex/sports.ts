import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllSports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sports").collect();
  },
});

export const getSportById = query({
  args: { id: v.id("sports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const bookTrialGuest = mutation({
  args: {
    sportId: v.id("sports"),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      sportId: args.sportId,
      type: "trial",
      status: "pending",
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone: args.guestPhone,
    });
  },
});

export const enrollNowGuest = mutation({
  args: {
    sportId: v.id("sports"),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      sportId: args.sportId,
      type: "enrollment",
      status: "pending",
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone: args.guestPhone,
    });
  },
});
