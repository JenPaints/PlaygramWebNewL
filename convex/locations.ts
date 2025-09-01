import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new location
export const createLocation = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    imageUrl: v.optional(v.string()),
    facilities: v.array(v.string()),
    contactPhone: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const locationId = await ctx.db.insert("locations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return locationId;
  },
});

// Get all locations
export const getAllLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("locations").collect();
  },
});

// Get active locations
export const getActiveLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get locations by city
export const getLocationsByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Update location
export const updateLocation = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    facilities: v.optional(v.array(v.string())),
    contactPhone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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

// Delete location
export const deleteLocation = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get location by ID
export const getLocationById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Find nearest locations based on coordinates
export const findNearestLocations = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    maxDistance: v.optional(v.number()), // in kilometers
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const locations = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const maxDistance = args.maxDistance || 50; // Default 50km
    const limit = args.limit || 10;

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const locationsWithDistance = locations
      .map(location => ({
        ...location,
        distance: calculateDistance(
          args.latitude,
          args.longitude,
          location.latitude,
          location.longitude
        )
      }))
      .filter(location => location.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return locationsWithDistance;
  },
});

// Get cities with active locations
export const getCitiesWithLocations = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const cities = [...new Set(locations.map(location => location.city))];
    return cities.sort();
  },
});