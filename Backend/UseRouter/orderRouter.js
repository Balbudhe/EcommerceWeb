import express from "express";

import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  initiatePayment,
  verifyPayment,
  shipOrder,
  trackOrder,
  shiprocketWebhook,
  checkShippingServiceability,
} from "../Controller/orderController.js";
import { protect } from "../Middleware/authMiddleware.js";
import { isAdmin } from "../Middleware/isAdmin.js";

const orderRouter = express.Router();

orderRouter.post("/shiprocket/webhook", shiprocketWebhook);
orderRouter.get("/serviceability", checkShippingServiceability);

orderRouter.post("/", protect, createOrder);
orderRouter.post("/payment/create", protect, initiatePayment);
orderRouter.post("/payment/verify", protect, verifyPayment);
orderRouter.get("/my-orders", protect, getMyOrders);

orderRouter.get("/admin/all", protect, isAdmin, getAllOrders);
orderRouter.post("/admin/:id/ship", protect, isAdmin, shipOrder);
orderRouter.patch("/admin/:id/status", protect, isAdmin, updateOrderStatus);
orderRouter.patch(
  "/admin/:id/payment-status",
  protect,
  isAdmin,
  updatePaymentStatus,
);

orderRouter.get("/:id/track", protect, trackOrder);
orderRouter.get("/:id", protect, getOrderById);
orderRouter.patch("/:id/cancel", protect, cancelOrder);

export default orderRouter;
