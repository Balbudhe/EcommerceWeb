import express from "express";
import Category from "../Models/Category.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Unable to load categories" });
  }
});

export default router;
