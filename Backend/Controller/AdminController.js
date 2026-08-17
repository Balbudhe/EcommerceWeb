import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Product from "../Models/Products.js";
import Order from "../Models/Order.js";
import Promotion from "../Models/Promotion.js";

export const adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log("ADMIN LOGIN REQUEST");
      console.log("Email:", email);
      console.log("Password received:", !!password);
  
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }
  
      const user = await User.findOne({ email });
  
      console.log("User found:", !!user);
  
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
  
      console.log("User role:", user.role);
  
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
      );
  
      console.log(
        "Password correct:",
        isPasswordCorrect
      );
  
      if (!isPasswordCorrect) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
  
      if (user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied",
        });
      }
  
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
  
      return res.status(200).json({
        message: "Admin login successful",
        token,
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  
    } catch (error) {
      console.error("Admin login error:", error);
  
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

export const getDashboard = async (_req, res) => {
  try {
    const [products, orders, users, promotions] = await Promise.all([
      Product.find().sort({ createdAt: -1 }),
      Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
      User.find().select("-password").sort({ createdAt: -1 }),
      Promotion.find().sort({ createdAt: -1 }),
    ]);
    const revenue = orders.filter((o) => o.orderStatus !== "CANCELLED").reduce((sum, o) => sum + o.totalAmount, 0);
    res.json({
      stats: { products: products.length, orders: orders.length, customers: users.filter((u) => u.role === "user").length, revenue },
      products, orders, users, promotions,
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createPromotion = async (req, res) => {
  try { res.status(201).json(await Promotion.create(req.body)); }
  catch (error) { res.status(400).json({ message: error.code === 11000 ? "Promotion code already exists" : error.message }); }
};

export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promotion) return res.status(404).json({ message: "Promotion not found" });
    res.json(promotion);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deletePromotion = async (req, res) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);
  if (!promotion) return res.status(404).json({ message: "Promotion not found" });
  res.json({ message: "Promotion deleted" });
};

export const createAdminProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created", product });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated", order });
  } catch (error) { res.status(400).json({ message: error.message }); }
};
