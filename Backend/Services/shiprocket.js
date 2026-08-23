const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let tokenCache = { token: null, expiresAt: 0 };

export const isShiprocketConfigured = () => {
  const email = String(process.env.SHIPROCKET_EMAIL || "").trim();
  const password = String(process.env.SHIPROCKET_PASSWORD || "").trim();
  return Boolean(email && password);
};

const getCredentials = () => ({
  email: String(process.env.SHIPROCKET_EMAIL || "").trim(),
  password: String(process.env.SHIPROCKET_PASSWORD || "").trim(),
});

const splitName = (fullName = "Customer") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" ") || "",
  };
};

const formatOrderDate = (date = new Date()) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const estimateWeightKg = (items = []) => {
  const units = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  return Math.max(0.5, Number((units * 0.4).toFixed(2)));
};

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
      `Shiprocket request failed (${response.status})`;
    const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getShiprocketToken(force = false) {
  const { email, password } = getCredentials();
  if (!email || !password) {
    const error = new Error("Shiprocket credentials are not configured");
    error.status = 503;
    throw error;
  }

  if (!force && tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  let data;
  try {
    data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    const message = String(error.message || "");
    if (/invalid email and password/i.test(message) || error.status === 401 || error.status === 403) {
      const hint = new Error(
        "Shiprocket login failed. Use API user email/password from Shiprocket → Settings → API → Create API User (not your panel login). Then restart the backend.",
      );
      hint.status = 401;
      hint.data = error.data;
      throw hint;
    }
    throw error;
  }

  if (!data?.token) {
    throw new Error("Unable to authenticate with Shiprocket");
  }

  // Tokens are valid ~10 days; refresh a day early.
  tokenCache = {
    token: data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };
  return data.token;
}

async function withAuth(path, options = {}) {
  const token = await getShiprocketToken();
  try {
    return await request(path, { ...options, token });
  } catch (error) {
    if (error.status === 401) {
      const fresh = await getShiprocketToken(true);
      return request(path, { ...options, token: fresh });
    }
    throw error;
  }
}

export function buildShiprocketPayload(order, user = {}) {
  const address = order.shippingAddress || {};
  const { firstName, lastName } = splitName(address.fullName || user.name);
  const phone = String(address.phone || "").replace(/\D/g, "").slice(-10);
  const weight = estimateWeightKg(order.items);
  const pickupLocation = String(
    process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
  ).trim();

  const payload = {
    order_id: String(order._id),
    order_date: formatOrderDate(order.createdAt || new Date()),
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: address.address,
    billing_city: address.city,
    billing_pincode: Number(address.pincode),
    billing_state: address.state,
    billing_country: "India",
    billing_email: user.email || process.env.SHIPROCKET_FALLBACK_EMAIL || "orders@vora.store",
    billing_phone: Number(phone),
    shipping_is_billing: true,
    order_items: (order.items || []).map((item, index) => ({
      name: item.name,
      sku: `${String(item.productId || "SKU").slice(-8)}-${item.size || "NA"}-${item.color || "NA"}-${index}`,
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
    })),
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    shipping_charges: order.shippingFee || 0,
    total_discount: order.discount || 0,
    sub_total: order.subtotal,
    length: 20,
    breadth: 15,
    height: 8,
    weight,
  };

  if (process.env.SHIPROCKET_CHANNEL_ID) {
    payload.channel_id = Number(process.env.SHIPROCKET_CHANNEL_ID);
  }

  return payload;
}

export async function createShiprocketOrder(order, user = {}) {
  const payload = buildShiprocketPayload(order, user);
  const data = await withAuth("/orders/create/adhoc", {
    method: "POST",
    body: payload,
  });

  return {
    shiprocketOrderId: data.order_id,
    shiprocketShipmentId: data.shipment_id,
    status: data.status || "NEW",
    raw: data,
  };
}

export async function getRecommendedCourier({
  pickupPincode,
  deliveryPincode,
  weight,
  codAmount = 0,
}) {
  const pickup =
    pickupPincode || process.env.SHIPROCKET_PICKUP_PINCODE || "";
  if (!pickup || !deliveryPincode) {
    throw new Error("Pickup and delivery pincodes are required for courier assignment");
  }

  const query = new URLSearchParams({
    pickup_postcode: String(pickup),
    delivery_postcode: String(deliveryPincode),
    weight: String(weight || 0.5),
    cod: String(codAmount > 0 ? 1 : 0),
  });

  const data = await withAuth(`/courier/serviceability/?${query.toString()}`);
  const available =
    data?.data?.available_courier_companies ||
    data?.available_courier_companies ||
    [];

  if (!available.length) {
    throw new Error("No courier available for this pincode");
  }

  const recommendedId = data?.data?.recommended_courier_company_id;
  const recommended =
    available.find((c) => String(c.courier_company_id) === String(recommendedId)) ||
    available.sort((a, b) => Number(a.freight_charge || 0) - Number(b.freight_charge || 0))[0];

  return recommended;
}

export async function assignAwb(shipmentId, courierId) {
  const body = { shipment_id: shipmentId };
  if (courierId) body.courier_id = courierId;

  const data = await withAuth("/courier/assign/awb", {
    method: "POST",
    body,
  });

  const response = data?.response?.data || data?.response || data;
  return {
    awbCode: response?.awb_code || response?.awb || data?.awb_code,
    courierName: response?.courier_name || response?.courier_company_id || "",
    shiprocketShipmentId: response?.shipment_id || shipmentId,
    status: response?.status || "AWB_ASSIGNED",
    raw: data,
  };
}

export async function requestPickup(shipmentIds = []) {
  const ids = (Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]).filter(Boolean);
  if (!ids.length) throw new Error("Shipment id is required for pickup");

  return withAuth("/courier/generate/pickup", {
    method: "POST",
    body: { shipment_id: ids },
  });
}

export async function cancelShiprocketOrders(orderIds = []) {
  const ids = (Array.isArray(orderIds) ? orderIds : [orderIds])
    .map((id) => Number(id) || id)
    .filter(Boolean);
  if (!ids.length) return null;

  return withAuth("/orders/cancel", {
    method: "POST",
    body: { ids },
  });
}

export async function trackByAwb(awb) {
  if (!awb) throw new Error("AWB code is required");
  return withAuth(`/courier/track/awb/${encodeURIComponent(awb)}`);
}

export async function checkServiceability({
  deliveryPincode,
  weight = 0.5,
  codAmount = 0,
}) {
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickup) {
    return { serviceable: true, couriers: [], message: "Pickup pincode not configured" };
  }

  try {
    const courier = await getRecommendedCourier({
      pickupPincode: pickup,
      deliveryPincode,
      weight,
      codAmount,
    });
    return {
      serviceable: true,
      courier,
      estimatedDays: courier?.etd || courier?.estimated_delivery_days,
      freightCharge: courier?.freight_charge,
    };
  } catch (error) {
    return { serviceable: false, message: error.message };
  }
}

export function mapShiprocketStatus(currentStatus = "") {
  const status = String(currentStatus).toUpperCase();

  if (["DELIVERED", "DELIVERY COMPLETED"].some((s) => status.includes(s))) {
    return "DELIVERED";
  }
  if (["OUT FOR DELIVERY", "OFD"].some((s) => status.includes(s))) {
    return "OUT_FOR_DELIVERY";
  }
  if (
    ["SHIPPED", "IN TRANSIT", "IN-TRANSIT", "DISPATCHED", "PICKED UP", "PICKED"].some((s) =>
      status.includes(s),
    )
  ) {
    return "SHIPPED";
  }
  if (["CANCELED", "CANCELLED", "LOST", "RTO DELIVERED", "RTO"].some((s) => status.includes(s))) {
    return "CANCELLED";
  }
  if (["PICKUP SCHEDULED", "PICKUP GENERATED", "AWB ASSIGNED", "LABEL GENERATED"].some((s) =>
    status.includes(s),
  )) {
    return "PROCESSING";
  }
  return null;
}

export function trackingUrlFor(awb) {
  if (!awb) return "";
  return `https://shiprocket.co/tracking/${awb}`;
}
