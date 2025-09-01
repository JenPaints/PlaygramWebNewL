import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Create a new merchandise order
export const createOrder = mutation({
  args: {
    customerPhone: v.string(),
    customerName: v.string(),
    items: v.array(v.object({
      merchandiseId: v.id("merchandise"),
      quantity: v.number(),
      size: v.optional(v.string()),
      color: v.optional(v.string()),
      price: v.number(),
    })),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Check stock availability for all items
    for (const item of args.items) {
      const merchandise = await ctx.db.get(item.merchandiseId);
      if (!merchandise) {
        throw new Error(`Merchandise item not found: ${item.merchandiseId}`);
      }
      if (merchandise.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${merchandise.name}. Available: ${merchandise.stockQuantity}, Requested: ${item.quantity}`);
      }
    }

    // Create the order
    let orderId;
    try {
      orderId = await ctx.db.insert("merchandiseOrders", {
        orderNumber,
        customerPhone: args.customerPhone,
        customerName: args.customerName,
        items: args.items,
        totalAmount: args.totalAmount,
        status: "pending",
        paymentStatus: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log(`Merchandise order created: ${orderId}`);
    } catch (error) {
      console.error(`Error creating merchandise order for customer ${args.customerPhone}:`, error);
      throw new Error('Failed to create order');
    }

    // Insert into payments table
    try {
      const paymentId = await ctx.runMutation(api.paymentTracking.createPaymentRecord, {
        type: "merchandise",
        userId: args.customerPhone,
        amount: args.totalAmount,
        currency: "INR",
        status: "pending",
        details: {
          merchandiseOrderId: orderId,
          orderNumber,
          items: args.items
        },
        metadata: { source: "merchandiseOrders.createOrder" }
      });
      console.log(`Payment record inserted for order: ${orderId}`);
    } catch (error) {
      console.error(`Error inserting payment for order ${orderId}:`, error);
    }

    return { orderId, orderNumber };
  },
});

// Update order payment details
export const updateOrderPayment = mutation({
  args: {
    orderId: v.optional(v.id("merchandiseOrders")),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    let order;
    
    if (args.orderId) {
      // Direct order ID provided
      order = await ctx.db.get(args.orderId);
    } else {
      // Find order by razorpay order ID
      order = await ctx.db
        .query("merchandiseOrders")
        .filter((q) => q.eq(q.field("razorpayOrderId"), args.razorpayOrderId))
        .first();
    }
    
    if (!order) {
      throw new Error("Merchandise order not found for razorpay order: " + args.razorpayOrderId);
    }

    try {
      await ctx.db.patch(order._id, {
        razorpayOrderId: args.razorpayOrderId,
        razorpayPaymentId: args.razorpayPaymentId,
        paymentStatus: args.paymentStatus,
        status: args.paymentStatus === "paid" ? "paid" : order.status,
        updatedAt: Date.now(),
      });
      console.log(`Order payment updated for ${args.orderId}`);
    } catch (error) {
      console.error(`Error updating order payment for ${args.orderId}:`, error);
      throw new Error('Failed to update order payment');
    }

    // If payment is successful, reduce stock quantities
    if (args.paymentStatus === "paid") {
      try {
        for (const item of order.items) {
          const merchandise = await ctx.db.get(item.merchandiseId);
          if (merchandise) {
            await ctx.db.patch(item.merchandiseId, {
              stockQuantity: Math.max(0, merchandise.stockQuantity - item.quantity),
              updatedAt: Date.now(),
            });
          }
        }
        console.log(`Stock reduced for order ${args.orderId}`);
      } catch (error) {
        console.error(`Error reducing stock for order ${args.orderId}:`, error);
      }
    }

    // Update payments table
    try {
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_user", (q) => q.eq("userId", order.customerPhone))
        .filter((q) => q.eq(q.field("details.merchandiseOrderId"), args.orderId))
        .first();

      if (payment) {
        await ctx.runMutation(api.paymentTracking.updatePaymentRecord, {
          paymentId: payment._id,
          status: args.paymentStatus === "paid" ? "completed" : args.paymentStatus === "failed" ? "failed" : "pending",
          details: {
            razorpayOrderId: args.razorpayOrderId,
            razorpayPaymentId: args.razorpayPaymentId
          },
          metadata: { source: "merchandiseOrders.updateOrderPayment" }
        });
        console.log(`Payment status updated for order ${args.orderId}`);
      }
    } catch (error) {
      console.error(`Error updating payment status for order ${args.orderId}:`, error);
    }

    return args.orderId;
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("merchandiseOrders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("ready_for_collection"),
      v.literal("collected"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.notes) {
      updateData.notes = args.notes;
    }

    if (args.status === "collected") {
      updateData.collectionDate = Date.now();
    }

    await ctx.db.patch(args.orderId, updateData);

    // Send notification for status updates
    try {
      // Find user by phone number
      const user = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("phone"), order.customerPhone))
        .first();

      if (user) {
         // Get first item name for notification
         let firstItemName = "Your order";
         if (order.items.length > 0) {
           const firstItem = order.items[0];
           const merchandise = await ctx.db.get(firstItem.merchandiseId);
           firstItemName = merchandise?.name || "Your order";
         }
        
        // Create status-specific notification
        let notificationTitle = "Order Update";
        let notificationMessage = "Your order status has been updated.";
        let notificationType: "info" | "success" | "warning" | "error" | "announcement" = "info";
        
        switch (args.status) {
          case "paid":
            notificationTitle = "Payment Confirmed";
            notificationMessage = `Payment confirmed for ${firstItemName}. Your order is being processed.`;
            notificationType = "success";
            break;
          case "processing":
            notificationTitle = "Order Processing";
            notificationMessage = `Your order for ${firstItemName} is now being processed.`;
            notificationType = "info";
            break;
          case "ready_for_collection":
            notificationTitle = "Ready for Collection";
            notificationMessage = `Great news! Your order for ${firstItemName} is ready for collection.`;
            notificationType = "success";
            break;
          case "collected":
            notificationTitle = "Order Collected";
            notificationMessage = `Thank you! Your order for ${firstItemName} has been collected. Enjoy your new gear!`;
            notificationType = "success";
            break;
          case "cancelled":
            notificationTitle = "Order Cancelled";
            notificationMessage = `Your order for ${firstItemName} has been cancelled. ${args.notes || ""}`;
            notificationType = "warning";
            break;
        }

        // Create notification
        const notificationId = await ctx.db.insert("notifications", {
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          targetType: "specific_user",
          targetId: user._id,
          senderId: user._id,
          priority: "medium",
          actionUrl: `/dashboard/merchandise`,
          actionText: "View Orders",
          isRead: false,
          sentAt: Date.now(),
          createdAt: Date.now(),
        });

        // Create user notification record
        await ctx.db.insert("userNotifications", {
          userId: user._id,
          notificationId,
          deliveryStatus: "delivered",
          deliveredAt: Date.now(),
          createdAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to send order status notification:", error);
      // Don't throw error to avoid breaking the order update
    }

    return args.orderId;
  },
});

// Get all orders (for admin)
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("merchandiseOrders").order("desc").collect();
    
    // Populate merchandise details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const merchandise = await ctx.db.get(item.merchandiseId);
            return {
              ...item,
              merchandiseName: merchandise?.name || "Unknown Item",
              merchandiseImage: merchandise?.imageUrl || "",
            };
          })
        );
        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Get orders by customer phone
export const getOrdersByCustomer = query({
  args: { customerPhone: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("merchandiseOrders")
      .withIndex("by_customer", (q) => q.eq("customerPhone", args.customerPhone))
      .order("desc")
      .collect();

    // Populate merchandise details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const merchandise = await ctx.db.get(item.merchandiseId);
            return {
              ...item,
              merchandiseName: merchandise?.name || "Unknown Item",
              merchandiseImage: merchandise?.imageUrl || "",
            };
          })
        );
        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Get order by order number
export const getOrderByNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("merchandiseOrders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    if (!order) {
      return null;
    }

    // Populate merchandise details
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const merchandise = await ctx.db.get(item.merchandiseId);
        return {
          ...item,
          merchandiseName: merchandise?.name || "Unknown Item",
          merchandiseImage: merchandise?.imageUrl || "",
        };
      })
    );

    return {
      ...order,
      items: itemsWithDetails,
    };
  },
});

// Get orders by status
export const getOrdersByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("ready_for_collection"),
      v.literal("collected"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("merchandiseOrders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    // Populate merchandise details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const merchandise = await ctx.db.get(item.merchandiseId);
            return {
              ...item,
              merchandiseName: merchandise?.name || "Unknown Item",
              merchandiseImage: merchandise?.imageUrl || "",
            };
          })
        );
        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Get order statistics for admin dashboard
export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("merchandiseOrders").collect();
    
    const stats = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === "pending").length,
      paidOrders: allOrders.filter(o => o.status === "paid").length,
      processingOrders: allOrders.filter(o => o.status === "processing").length,
      readyForCollection: allOrders.filter(o => o.status === "ready_for_collection").length,
      collectedOrders: allOrders.filter(o => o.status === "collected").length,
      cancelledOrders: allOrders.filter(o => o.status === "cancelled").length,
      totalRevenue: allOrders
        .filter(o => o.paymentStatus === "paid")
        .reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: allOrders.length > 0 
        ? allOrders.reduce((sum, order) => sum + order.totalAmount, 0) / allOrders.length 
        : 0,
    };

    return stats;
  },
});

// Cancel order
export const cancelOrder = mutation({
  args: {
    orderId: v.id("merchandiseOrders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "collected" || order.status === "cancelled") {
      throw new Error("Cannot cancel this order");
    }

    // If order was paid, restore stock quantities
    if (order.paymentStatus === "paid") {
      for (const item of order.items) {
        const merchandise = await ctx.db.get(item.merchandiseId);
        if (merchandise) {
          await ctx.db.patch(item.merchandiseId, {
            stockQuantity: merchandise.stockQuantity + item.quantity,
            updatedAt: Date.now(),
          });
        }
      }
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      notes: args.reason || "Order cancelled",
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

// Test function to debug merchandise payment verification
export const testMerchandisePaymentVerification = mutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('🧪 Testing merchandise payment verification for:', args);
    
    try {
      // Find the order
      const order = await ctx.db
        .query("merchandiseOrders")
        .filter((q) => q.eq(q.field("razorpayOrderId"), args.razorpayOrderId))
        .first();
      
      if (!order) {
        return {
          success: false,
          error: "Order not found",
          razorpayOrderId: args.razorpayOrderId
        };
      }
      
      console.log('📦 Found order:', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        paymentStatus: order.paymentStatus,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount
      });
      
      // Try to update the payment
      await ctx.runMutation(api.merchandiseOrders.updateOrderPayment, {
        razorpayOrderId: args.razorpayOrderId,
        razorpayPaymentId: args.razorpayPaymentId,
        paymentStatus: "paid",
      });
      
      console.log('✅ Payment update successful');
      
      // Check the updated order
      const updatedOrder = await ctx.db.get(order._id);
      
      return {
        success: true,
        message: "Payment verification successful",
        orderDetails: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          oldStatus: order.status,
          newStatus: updatedOrder?.status,
          oldPaymentStatus: order.paymentStatus,
          newPaymentStatus: updatedOrder?.paymentStatus,
        }
      };
      
    } catch (error: any) {
      console.error('❌ Merchandise payment verification failed:', error);
      return {
        success: false,
        error: error.message,
        razorpayOrderId: args.razorpayOrderId
      };
    }
  },
});

// Fix successful payments marked as failed
export const fixSuccessfulPayments = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔧 Starting to fix successful payments marked as failed...');
    
    const fixedOrders = [];
    const errors = [];
    
    try {
      // Get all orders with failed payment status but valid payment IDs
      const orders = await ctx.db.query("merchandiseOrders").collect();
      
      for (const order of orders) {
        // Check if order has failed payment status but valid payment ID
        if (order.paymentStatus === 'failed' && order.razorpayPaymentId && order.razorpayPaymentId.startsWith('pay_')) {
          console.log(`🔍 Found potentially successful payment marked as failed:`, {
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentId: order.razorpayPaymentId,
            currentStatus: order.paymentStatus
          });
          
          try {
            // Update the order to paid status
            await ctx.db.patch(order._id, {
              paymentStatus: 'paid',
              status: 'paid',
              updatedAt: Date.now()
            });
            
            // Update corresponding payment tracking record
            const paymentRecord = await ctx.db
              .query("payments")
              .filter((q) => q.eq(q.field("details.merchandiseOrderId"), order._id))
              .first();
            
            if (paymentRecord) {
              await ctx.runMutation(api.paymentTracking.updatePaymentRecord, {
                paymentId: paymentRecord._id,
                status: "completed",
                details: {
                  razorpayOrderId: order.razorpayOrderId,
                  razorpayPaymentId: order.razorpayPaymentId
                },
                metadata: { source: "fixSuccessfulPayments" }
              });
              
              console.log(`✅ Fixed payment tracking for order ${order.orderNumber}`);
            }
            
            fixedOrders.push({
              orderId: order._id,
              orderNumber: order.orderNumber,
              paymentId: order.razorpayPaymentId,
              customerPhone: order.customerPhone
            });
            
            console.log(`✅ Fixed order ${order.orderNumber} - marked as paid`);
            
          } catch (error: any) {
            console.error(`❌ Error fixing order ${order.orderNumber}:`, error);
            errors.push({
              orderId: order._id,
              orderNumber: order.orderNumber,
              error: error.message
            });
          }
        }
      }
      
      console.log(`🎉 Payment fix completed:`, {
        totalFixed: fixedOrders.length,
        totalErrors: errors.length
      });
      
      return {
        success: true,
        message: `Fixed ${fixedOrders.length} payments`,
        fixedOrders,
        errors
      };
      
    } catch (error: any) {
      console.error('❌ Critical error in fixSuccessfulPayments:', error);
      return {
        success: false,
        error: error.message,
        fixedOrders,
        errors
      };
    }
  },
});