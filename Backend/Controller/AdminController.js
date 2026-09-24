import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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
const publicAdmin = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});
const signAdmin = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
const frontendOrigin = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
export const login = async (req, res) => {
  try {
    const { email, password } = req.body,
      u = await User.findOne({ email: String(email || "").trim().toLowerCase() });
    if (!u || !(await bcrypt.compare(password || "", u.password)))
      return res.status(401).json({ message: "Invalid credentials" });
    if (u.role !== "admin")
      return res.status(404).json({ message: "Page not found" });
    res.json({ token: signAdmin(u), user: publicAdmin(u) });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    if (String(password).length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail }))
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    const u = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "admin",
    });
    res.status(201).json({ token: signAdmin(u), user: publicAdmin(u) });
  } catch {
    res.status(500).json({ message: "Unable to create administrator" });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      return res.status(500).json({
        message: "Email is not configured. Check EMAIL_USER and EMAIL_PASS in .env",
      });
    if (!process.env.JWT_SECRET)
      return res.status(500).json({ message: "JWT_SECRET is missing in .env" });
    const u = await User.findOne({ email, role: "admin" });
    if (!u)
      return res
        .status(400)
        .json({ message: "No administrator found with that email" });
    const token = jwt.sign({ id: u._id, purpose: "admin-reset" }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const resetLink = `${frontendOrigin()}/admin/reset-password?token=${token}`;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: String(process.env.EMAIL_PASS).replace(/\s+/g, ""),
      },
    });
    await transporter.verify();
    await transporter.sendMail({
      from: `"Artiqulate Lifestyle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Artiqulate Atelier password",
      text: `Hello ${u.name},\n\nClick this link to reset your admin password (valid for 10 minutes):\n${resetLink}\n\nIf you did not request this, ignore this email.`,
      html: `
        <p>Hello <strong>${u.name}</strong>,</p>
        <p>Click the button below to reset your administrator password. This link expires in <strong>10 minutes</strong>.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#17243a;color:#fff;text-decoration:none;border-radius:8px;">Reset password</a></p>
        <p>Or copy this link:<br/><a href="${resetLink}">${resetLink}</a></p>
      `,
    });
    res.json({ message: "Reset link sent. Check your email." });
  } catch (error) {
    let message = "Failed to send reset email";
    if (
      error.code === "EAUTH" ||
      /Invalid login|Username and Password not accepted/i.test(error.message || "")
    ) {
      message =
        "Gmail login failed. Use a Gmail App Password and remove spaces in EMAIL_PASS.";
    } else if (error.message) {
      message = error.message;
    }
    res.status(500).json({ message });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    if (String(password).length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const u = await User.findById(decoded.id);
    if (!u || u.role !== "admin")
      return res.status(400).json({ message: "Invalid or expired reset link" });
    u.password = await bcrypt.hash(password, 10);
    await u.save();
    res.json({ message: "Password reset successfully. You can sign in now." });
  } catch {
    res.status(400).json({ message: "Invalid or expired reset link" });
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
export const updateCategory = async (req, res) => {
  try {
    const current = await Category.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Category not found" });
    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.image !== undefined) updates.image = req.body.image;
    if (req.body.active !== undefined) updates.active = req.body.active;
    if (req.body.subcategories !== undefined) updates.subcategories = req.body.subcategories;
    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (updates.name && updates.name !== current.name) {
      await Product.updateMany({ category: current.name }, { category: updates.name });
    }
    res.json({ category });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted", category });
};
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
