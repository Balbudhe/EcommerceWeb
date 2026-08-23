import Order from "../Models/Order.js";
import Product from "../Models/Products.js";
import crypto from "crypto";
import {
  applyTrackingUpdate,
  cancelShiprocketForOrder,
  pushOrderToShiprocket,
  shipOrderWithShiprocket,
} from "../Services/shipping.js";
import {
  checkServiceability,
  isShiprocketConfigured,
  trackByAwb,
} from "../Services/shiprocket.js";

const calculateOrder = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are required");
  }

  const products = await Product.find({
    _id: { $in: items.map((item) => item.productId) },
  });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const orderItems = items.map((item) => {
    const product = productMap.get(String(item.productId));
    const quantity = Number(item.quantity);
    if (!product) throw new Error("One or more products no longer exist");
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid product quantity");
    }
    const variant = product.variants.find(
      (entry) => entry.size === (item.size || "") && entry.color === (item.color || ""),
    );
    if (variant && variant.stock < quantity) {
      throw new Error(`${product.title} does not have enough stock`);
    }
    return {
      productId: product._id,
      name: product.title,
      price: product.price,
      image: product.images?.[0] || "",
      size: item.size || "",
      color: item.color || "",
      quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal >= 999 ? 0 : 79;
  return { orderItems, subtotal, shippingFee, totalAmount: subtotal + shippingFee };
};

const normalizeAddress = (address = {}) => ({
  fullName: address.fullName,
  phone: address.phone,
  address: address.address,
  city: address.city,
  state: address.state,
  pincode: address.pincode || address.zip,
});

const createRazorpayOrder = async ({ amount, receipt }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error("Razorpay API keys are not configured");
    error.status = 503;
    throw error;
  }
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency: "INR", receipt }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description || "Unable to start payment");
  }
  return data;
};

export const createOrder = async (req, res) => {
  try {
    const { orderItems, subtotal, shippingFee, totalAmount } =
      await calculateOrder(req.body.items);
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      shippingAddress: normalizeAddress(req.body.shippingAddress),
      subtotal,
      shippingFee,
      discount: 0,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    try {
      await pushOrderToShiprocket(order);
    } catch (shippingError) {
      console.warn("Shiprocket create (COD) warning:", shippingError.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(error.status || 400).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

export const initiatePayment = async (req, res) => {
  try {
    const { orderItems, subtotal, shippingFee, totalAmount } =
      await calculateOrder(req.body.items);
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      shippingAddress: normalizeAddress(req.body.shippingAddress),
      subtotal,
      shippingFee,
      discount: 0,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });
    const gatewayOrder = await createRazorpayOrder({
      amount: Math.round(totalAmount * 100),
      receipt: String(order._id),
    });
    order.razorpayOrderId = gatewayOrder.id;
    await order.save();
    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      gatewayOrder: {
        id: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
      },
      orderId: order._id,
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user.id,
    }).select("+razorpaySignature");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "PAID") return res.json({ order });
    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Incomplete payment response" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    const valid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    if (!valid) return res.status(400).json({ message: "Payment verification failed" });

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";
    await order.save();

    try {
      await pushOrderToShiprocket(order);
    } catch (shippingError) {
      console.warn("Shiprocket create (ONLINE) warning:", shippingError.message);
    }

    res.json({ message: "Payment verified", order });
  } catch (error) {
    res.status(400).json({ message: error.message || "Payment verification failed" });
  }
};


// GET LOGGED-IN USER ORDERS

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      $or: [
        { paymentMethod: "COD" },
        { paymentStatus: { $in: ["PAID", "REFUNDED"] } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};


// GET ALL ORDERS - ADMIN
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};



// UPDATE ORDER STATUS - ADMIN
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot change status",
      });
    }

    if (orderStatus === "SHIPPED" || orderStatus === "PROCESSING") {
      try {
        if (orderStatus === "SHIPPED" || !order.awbCode) {
          await shipOrderWithShiprocket(order);
        } else {
          order.orderStatus = orderStatus;
          await order.save();
        }
      } catch (shippingError) {
        return res.status(shippingError.status || 400).json({
          success: false,
          message: shippingError.message || "Unable to create shipment",
        });
      }
    } else {
      order.orderStatus = orderStatus;
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};


// UPDATE PAYMENT STATUS

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        paymentStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};


// CANCEL ORDER - USER

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Don't allow cancellation after shipping
    const nonCancellableStatuses = [
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "CANCELLED";
    if (order.paymentStatus === "PAID") {
      order.paymentStatus = "REFUNDED";
    }

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const variant = product.variants.find(
        (entry) =>
          entry.size === (item.size || "") && entry.color === (item.color || ""),
      );
      if (variant) {
        variant.stock += item.quantity;
        await product.save();
      }
    }

    await order.save();
    await cancelShiprocketForOrder(order);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// ADMIN: create AWB + schedule pickup via Shiprocket
export const shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be shipped",
      });
    }

    await shipOrderWithShiprocket(order);
    res.json({
      success: true,
      message: "Shipment created with Shiprocket",
      order,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || "Failed to create shipment",
    });
  }
};

// USER/ADMIN: track order
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = String(order.userId) === String(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    let live = null;
    if (order.awbCode && isShiprocketConfigured()) {
      try {
        live = await trackByAwb(order.awbCode);
        applyTrackingUpdate(order, live);
        await order.save();
      } catch (error) {
        console.warn("Live tracking warning:", error.message);
      }
    }

    res.json({
      success: true,
      tracking: {
        awbCode: order.awbCode,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        shipmentStatus: order.shipmentStatus,
        orderStatus: order.orderStatus,
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        live,
      },
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to track order",
    });
  }
};

// PUBLIC: Shiprocket webhook (configure URL in Shiprocket panel)
export const shiprocketWebhook = async (req, res) => {
  try {
    const secret = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (secret) {
      const provided =
        req.headers["x-api-key"] ||
        req.headers["x-shiprocket-token"] ||
        req.query.token;
      if (provided !== secret) {
        return res.status(401).json({ message: "Invalid webhook token" });
      }
    }

    const body = req.body || {};
    const awb =
      body.awb ||
      body.awb_code ||
      body?.tracking_data?.awb_code ||
      body?.shipment_track?.[0]?.awb_code;
    const srOrderId = body.order_id || body.sr_order_id;
    const channelOrderId = body.channel_order_id || body.order_id;

    let order = null;
    if (awb) order = await Order.findOne({ awbCode: String(awb) });
    if (!order && channelOrderId) {
      order = await Order.findById(String(channelOrderId)).catch(() => null);
    }
    if (!order && srOrderId) {
      order = await Order.findOne({ shiprocketOrderId: String(srOrderId) });
    }

    if (!order) {
      return res.status(200).json({ received: true, matched: false });
    }

    applyTrackingUpdate(order, body);
    await order.save();
    res.status(200).json({ received: true, matched: true, orderId: order._id });
  } catch (error) {
    console.error("Shiprocket webhook error:", error);
    res.status(200).json({ received: true, error: error.message });
  }
};

export const checkShippingServiceability = async (req, res) => {
  try {
    const pincode = req.query.pincode || req.body?.pincode;
    if (!pincode) {
      return res.status(400).json({ success: false, message: "Pincode is required" });
    }
    const result = await checkServiceability({
      deliveryPincode: pincode,
      weight: Number(req.query.weight || req.body?.weight || 0.5),
      codAmount: Number(req.query.cod || req.body?.cod || 0),
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
