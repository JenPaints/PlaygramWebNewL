import { query } from "./_generated/server";

export const getAllTestimonials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("testimonials").collect();
  },
});
