import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const submitEnquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    sport: v.string(),
    message: v.string(),
  },
  handler: async (ctx: MutationCtx, args: { name: string; email: string; phone: string; sport: string; message: string }) => {
    await ctx.db.insert("enquiries", {
      ...args,
      status: "new",
    });
  },
});

export const getUserEnquiries = query({
  args: { phone: v.string() },
  handler: async (ctx: QueryCtx, { phone }: { phone: string }) => {
    return await ctx.db
      .query("enquiries")
      .filter((q: any) => q.eq(q.field("phone"), phone))
      .order("desc")
      .collect();
  },
});

export const getAllEnquiries = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("enquiries")
      .order("desc")
      .collect();
  },
});

export const updateEnquiryStatus = mutation({
  args: {
    enquiryId: v.id("enquiries"),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("resolved")),
  },
  handler: async (ctx: MutationCtx, { enquiryId, status }: { enquiryId: any; status: "new" | "contacted" | "resolved" }) => {
    await ctx.db.patch(enquiryId, { status });
  },
});
