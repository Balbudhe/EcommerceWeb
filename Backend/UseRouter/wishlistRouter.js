import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../Controller/wishlistController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
