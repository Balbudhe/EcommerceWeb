import User from "../Models/User.js";
import {
  assignAwb,
  cancelShiprocketOrders,
  createShiprocketOrder,
  getRecommendedCourier,
  isShiprocketConfigured,
  mapShiprocketStatus,
  requestPickup,
  trackingUrlFor,
} from "./shiprocket.js";

export async function pushOrderToShiprocket(order) {
  if (!isShiprocketConfigured()) {
    return { skipped: true, reason: "Shiprocket is not configured" };
  }
  if (order.shiprocketOrderId) {
    return {
      skipped: true,
      reason: "Already pushed",
      shiprocketOrderId: order.shiprocketOrderId,
      shiprocketShipmentId: order.shiprocketShipmentId,
    };
  }

  const user = await User.findById(order.userId).select("name email");
  const result = await createShiprocketOrder(order, user || {});

  order.shiprocketOrderId = String(result.shiprocketOrderId || "");
  order.shiprocketShipmentId = String(result.shiprocketShipmentId || "");
  order.shipmentStatus = result.status || "NEW";
  await order.save();

  return result;
}

export async function shipOrderWithShiprocket(order) {
  if (!isShiprocketConfigured()) {
    if (order.orderStatus !== "CANCELLED" && order.orderStatus !== "DELIVERED") {
      order.orderStatus = "SHIPPED";
      order.shipmentStatus = order.shipmentStatus || "MANUAL";
      await order.save();
    }
    return { skipped: true, reason: "Shiprocket is not configured", order };
  }

  if (!order.shiprocketOrderId || !order.shiprocketShipmentId) {
    await pushOrderToShiprocket(order);
  }

  if (!order.shiprocketShipmentId) {
    throw new Error("Shiprocket shipment id missing for this order");
  }

  if (!order.awbCode) {
    const courier = await getRecommendedCourier({
      deliveryPincode: order.shippingAddress?.pincode,
      weight: Math.max(
        0.5,
        Number(
          (
            (order.items || []).reduce((n, i) => n + Number(i.quantity || 1), 0) *
            0.4
          ).toFixed(2),
        ),
      ),
      codAmount:
        order.paymentMethod === "COD" && order.paymentStatus !== "PAID"
          ? order.totalAmount
          : 0,
    });

    const assigned = await assignAwb(
      order.shiprocketShipmentId,
      courier?.courier_company_id,
    );

    order.awbCode = String(assigned.awbCode || "");
    order.courierName = String(
      assigned.courierName || courier?.courier_name || "",
    );
    order.trackingUrl = trackingUrlFor(order.awbCode);
    order.shipmentStatus = assigned.status || "AWB_ASSIGNED";
  }

  try {
    await requestPickup([order.shiprocketShipmentId]);
    order.shipmentStatus = order.shipmentStatus || "PICKUP_SCHEDULED";
  } catch (error) {
    // AWB may already have pickup scheduled; keep shipping progress.
    console.warn("Shiprocket pickup warning:", error.message);
  }

  if (order.orderStatus !== "CANCELLED" && order.orderStatus !== "DELIVERED") {
    order.orderStatus = "SHIPPED";
  }

  await order.save();
  return order;
}

export async function cancelShiprocketForOrder(order) {
  if (!isShiprocketConfigured() || !order.shiprocketOrderId) {
    return { skipped: true };
  }

  try {
    await cancelShiprocketOrders([order.shiprocketOrderId]);
    order.shipmentStatus = "CANCELLED";
    await order.save();
    return { cancelled: true };
  } catch (error) {
    console.warn("Shiprocket cancel warning:", error.message);
    return { skipped: true, reason: error.message };
  }
}

export function applyTrackingUpdate(order, trackingPayload = {}) {
  const track =
    trackingPayload?.tracking_data ||
    trackingPayload?.shipment_track?.[0] ||
    trackingPayload;

  const currentStatus =
    track?.shipment_status ||
    track?.current_status ||
    track?.sr_status ||
    trackingPayload?.current_status ||
    trackingPayload?.shipment_status ||
    "";

  if (currentStatus) {
    order.shipmentStatus = String(currentStatus);
  }

  const awb =
    track?.awb_code ||
    track?.awb ||
    trackingPayload?.awb ||
    trackingPayload?.awb_code;
  if (awb && !order.awbCode) {
    order.awbCode = String(awb);
    order.trackingUrl = trackingUrlFor(order.awbCode);
  }

  const mapped = mapShiprocketStatus(currentStatus);
  if (mapped && order.orderStatus !== "CANCELLED") {
    order.orderStatus = mapped;
  }

  return order;
}
