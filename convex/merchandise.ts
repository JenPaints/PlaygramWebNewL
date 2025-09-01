import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new merchandise item
export const createMerchandise = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.string(),
    sizes: v.array(v.string()),
    colors: v.array(v.string()),
    stockQuantity: v.number(),
    isActive: v.boolean(),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const merchandiseId = await ctx.db.insert("merchandise", {
      name: args.name,
      description: args.description,
      price: args.price,
      imageUrl: args.imageUrl,
      category: args.category,
      sizes: args.sizes,
      colors: args.colors,
      stockQuantity: args.stockQuantity,
      isActive: args.isActive,
      isFeatured: args.isFeatured || false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return merchandiseId;
  },
});

// Get all merchandise items
export const getAllMerchandise = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("merchandise").collect();
  },
});

// Get active merchandise items for students
export const getActiveMerchandise = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("merchandise")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get merchandise by category
export const getMerchandiseByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("merchandise")
      .filter((q) => 
        q.and(
          q.eq(q.field("category"), args.category),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

// Update merchandise item
export const updateMerchandise = mutation({
  args: {
    id: v.id("merchandise"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    sizes: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    stockQuantity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Delete merchandise item
export const deleteMerchandise = mutation({
  args: { id: v.id("merchandise") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update stock quantity
export const updateStock = mutation({
  args: {
    id: v.id("merchandise"),
    quantity: v.number(),
    operation: v.union(v.literal("add"), v.literal("subtract"), v.literal("set")),
  },
  handler: async (ctx, args) => {
    const merchandise = await ctx.db.get(args.id);
    if (!merchandise) {
      throw new Error("Merchandise not found");
    }

    let newQuantity: number;
    switch (args.operation) {
      case "add":
        newQuantity = merchandise.stockQuantity + args.quantity;
        break;
      case "subtract":
        newQuantity = Math.max(0, merchandise.stockQuantity - args.quantity);
        break;
      case "set":
        newQuantity = Math.max(0, args.quantity);
        break;
    }

    await ctx.db.patch(args.id, {
      stockQuantity: newQuantity,
      updatedAt: Date.now(),
    });

    return newQuantity;
  },
});

// Get low stock items (for admin alerts)
export const getLowStockItems = query({
  args: { threshold: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const threshold = args.threshold || 10;
    return await ctx.db
      .query("merchandise")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.lte(q.field("stockQuantity"), threshold)
        )
      )
      .collect();
  },
});

// Get merchandise categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const merchandise = await ctx.db.query("merchandise").collect();
    const categories = [...new Set(merchandise.map(item => item.category))];
    return categories;
  },
});

// Get merchandise by ID
export const getMerchandiseById = query({
  args: { id: v.id("merchandise") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get featured merchandise items for student dashboard
export const getFeaturedMerchandise = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("merchandise")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("isFeatured"), true)
        )
      )
      .collect();
  },
});

// Toggle featured status for merchandise
export const toggleFeatured = mutation({
  args: { 
    id: v.id("merchandise"),
    isFeatured: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isFeatured: args.isFeatured,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});