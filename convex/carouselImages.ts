import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all active carousel images ordered by their order field
export const getActiveCarouselImages = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query("carouselImages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Sort by order field
    return images.sort((a, b) => a.order - b.order);
  },
});

// Get all carousel images for admin management
export const getAllCarouselImages = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query("carouselImages")
      .withIndex("by_created_at", (q) => q)
      .order("desc")
      .collect();
    
    return images;
  },
});

// Add a new carousel image
export const addCarouselImage = mutation({
  args: {
    title: v.optional(v.string()),
    imageUrl: v.string(),
    mobileImageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.number(),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    const imageId = await ctx.db.insert("carouselImages", {
      title: args.title,
      imageUrl: args.imageUrl,
      mobileImageUrl: args.mobileImageUrl,
      linkUrl: args.linkUrl,
      description: args.description,
      isActive: true,
      order: args.order,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: args.createdBy,
    });
    
    return imageId;
  },
});

// Update a carousel image
export const updateCarouselImage = mutation({
  args: {
    imageId: v.id("carouselImages"),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    mobileImageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { imageId, ...updateData } = args;
    
    const updateFields: any = {
      updatedAt: Date.now(),
    };
    
    // Only update provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        updateFields[key] = updateData[key as keyof typeof updateData];
      }
    });
    
    await ctx.db.patch(imageId, updateFields);
    
    return imageId;
  },
});

// Delete a carousel image
export const deleteCarouselImage = mutation({
  args: {
    imageId: v.id("carouselImages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.imageId);
    return { success: true };
  },
});

// Reorder carousel images
export const reorderCarouselImages = mutation({
  args: {
    imageOrders: v.array(v.object({
      imageId: v.id("carouselImages"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Update each image's order
    for (const { imageId, order } of args.imageOrders) {
      await ctx.db.patch(imageId, {
        order,
        updatedAt: timestamp,
      });
    }
    
    return { success: true };
  },
});

// Toggle image active status
export const toggleCarouselImageStatus = mutation({
  args: {
    imageId: v.id("carouselImages"),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    await ctx.db.patch(args.imageId, {
      isActive: !image.isActive,
      updatedAt: Date.now(),
    });
    
    return { success: true, newStatus: !image.isActive };
  },
});