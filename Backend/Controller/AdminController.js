import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import Product from "../Models/Products.js";
import Order from "../Models/Order.js";
import Category from "../Models/Category.js";
import Coupon from "../Models/Coupon.js";
import Slider from "../Models/Slider.js";
import {
  cancelShiprocketForOrder,
  shipOrderWithShiprocket,
} from "../Services/shipping.js";
const stock = (p) =>
  p.variants?.reduce((n, v) => n + Number(v.stock || 0), 0) || 0;
const safe = "name email role createdAt updatedAt";
export const login = async (req, res) => {
  try {
    const { email, password } = req.body,
      u = await User.findOne({ email });
    if (!u || !(await bcrypt.compare(password || "", u.password)))
      return res.status(401).json({ message: "Invalid credentials" });
    if (u.role !== "admin")
      return res.status(404).json({ message: "Page not found" });
    res.json({
      token: jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      }),
      user: { id: u._id, name: u.name, email: u.email, role: u.role },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};
export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select(safe);
  if (!user) return res.status(404).json({ message: "Page not found" });
  res.json({ user });
};
export const dashboard = async (_q, res) => {
  const [p, o, c] = await Promise.all([
    Product.find().sort({ createdAt: -1 }),
    Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
    User.countDocuments({ role: "user" }),
  ]);
  const count = (s) => o.filter((x) => x.orderStatus === s).length;
  res.json({
    stats: {
      products: p.length,
      orders: o.length,
      customers: c,
      revenue: o
        .filter((x) => x.orderStatus !== "CANCELLED")
        .reduce((n, x) => n + x.totalAmount, 0),
      pending: count("PLACED"),
      processing: count("PROCESSING"),
      shipped: count("SHIPPED"),
      delivered: count("DELIVERED"),
      lowStock: p.filter((x) => stock(x) < 10).length,
    },
    products: p,
    orders: o.slice(0, 8),
  });
};
export const products = async (_q, res) =>
  res.json({ products: await Product.find().sort({ createdAt: -1 }) });
export const product = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
};
export const addProduct = async (req, res) => {
  try {
    res.status(201).json({ product: await Product.create(req.body) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};
export const orders = async (_q, res) =>
  res.json({
    orders: await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 }),
  });
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        message: "Cancelled orders cannot change status",
      });
    }

    const nextStatus = req.body.orderStatus;
    if (nextStatus === "SHIPPED") {
      await shipOrderWithShiprocket(order);
    } else if (nextStatus === "CANCELLED") {
      order.orderStatus = "CANCELLED";
      await order.save();
      await cancelShiprocketForOrder(order);
    } else {
      order.orderStatus = nextStatus;
      await order.save();
    }

    res.json({ order });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({ message: "Cancelled orders cannot be shipped" });
    }
    await shipOrderWithShiprocket(order);
    res.json({ message: "Shipment created", order });
  } catch (e) {
    res.status(e.status || 400).json({ message: e.message });
  }
};
export const users = async (_q, res) => {
  const users = await User.find().select(safe).sort({ createdAt: -1 });
  const orderSummary = await Order.aggregate([
    {
      $group: {
        _id: "$userId",
        orderCount: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [{ $ne: ["$orderStatus", "CANCELLED"] }, "$totalAmount", 0],
          },
        },
        lastOrder: { $max: "$createdAt" },
      },
    },
  ]);
  const summary = new Map(orderSummary.map((row) => [String(row._id), row]));
  res.json({
    users: users.map((user) => {
      const activity = summary.get(String(user._id));
      return {
        ...user.toObject(),
        orderCount: activity?.orderCount || 0,
        totalSpent: activity?.totalSpent || 0,
        lastOrder: activity?.lastOrder || null,
      };
    }),
  });
};
export const updateUser = async (req, res) => {
  try {
    if (
      String(req.user.id) === String(req.params.id) &&
      req.body.role &&
      req.body.role !== "admin"
    )
      return res
        .status(400)
        .json({ message: "You cannot remove your own administrator access" });
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim();
    if (["user", "admin"].includes(req.body.role)) updates.role = req.body.role;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select(safe);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const categories = async (_q, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }),
    counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
  res.json({
    categories: categories.map((c) => ({
      ...c.toObject(),
      count: counts.find((x) => x._id === c.name)?.count || 0,
    })),
  });
};
export const addCategory = async (req, res) => {
  try {
    res.status(201).json({ category: await Category.create(req.body) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const toggleCategory = async (req, res) =>
  res.json({
    category: await Category.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      { new: true },
    ),
  });
export const coupons = async (_q, res) =>
  res.json({ coupons: await Coupon.find().sort({ createdAt: -1 }) });
export const addCoupon = async (req, res) => {
  try {
    res.status(201).json({ coupon: await Coupon.create(req.body) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const toggleCoupon = async (req, res) =>
  res.json({
    coupon: await Coupon.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      { new: true },
    ),
  });
export const sliders = async (_q, res) =>
  res.json({ sliders: await Slider.find().sort({ createdAt: -1 }) });
export const addSlider = async (req, res) => {
  try {
    res.status(201).json({ slider: await Slider.create(req.body) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const toggleSlider = async (req, res) =>
  res.json({
    slider: await Slider.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      { new: true },
    ),
  });
export const settings = async (req, res) => {
  if (req.method === "PATCH")
    return res.json({
      user: await User.findByIdAndUpdate(
        req.user.id,
        { name: req.body.name },
        { new: true },
      ).select(safe),
    });
  res.json({ user: await User.findById(req.user.id).select(safe) });
};
