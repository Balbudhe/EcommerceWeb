import express from "express";
import { adminLogin, createAdminProduct, createPromotion, deleteAdminProduct, deletePromotion, getDashboard, updateAdminProduct, updateOrderStatus, updatePromotion } from "../Controller/AdminController.js";
import { protect } from "../Middleware/authMiddleware.js";
import { isAdmin } from "../Middleware/isAdmin.js";

const router = express.Router();

router.post("/login", adminLogin);
router.use(protect, isAdmin);
router.get("/dashboard", getDashboard);
router.post("/products", createAdminProduct);
router.patch("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);
router.patch("/orders/:id/status", updateOrderStatus);
router.post("/promotions", createPromotion);
router.patch("/promotions/:id", updatePromotion);
router.delete("/promotions/:id", deletePromotion);

export default router;
