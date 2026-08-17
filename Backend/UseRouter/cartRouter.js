import express from "express";
import { addToCart, getCart ,removeItem,updateQuantity,clearCart} from "../Controller/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/get/:userId", getCart);
router.put("/update-quantity/:userId/:productId", updateQuantity);
router.delete("/remove-item/:userId/:productId", removeItem);
router.delete("/clear/:userId", clearCart);
export default router;
