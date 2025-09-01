import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    sport: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists in waitlist
    const existingEntry = await ctx.db
      .query("waitlist")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingEntry) {
      throw new Error("Email already registered in waitlist");
    }

    // Add to waitlist
    const waitlistId = await ctx.db.insert("waitlist", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      sport: args.sport,
      status: "pending",
      source: args.source || "download_app_button",
    });

    return waitlistId;
  },
});

export const getWaitlistCount = query({
  handler: async (ctx) => {
    const count = await ctx.db.query("waitlist").collect();
    return count.length;
  },
});

export const getWaitlistEntries = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("waitlist")
      .order("desc")
      .take(args.limit || 50);
    
    return entries;
  },
});

export const updateWaitlistStatus = mutation({
  args: {
    id: v.id("waitlist"),
    status: v.union(v.literal("pending"), v.literal("notified"), v.literal("converted")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});