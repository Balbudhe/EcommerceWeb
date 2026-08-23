import express from "express";
import {createProduct,getAllProducts,updateproduct} from "../Controller/productController.js";
import { protect } from "../Middleware/authMiddleware.js";
import { isAdmin } from "../Middleware/isAdmin.js";
const router=express.Router();


router.post("/createproduct",protect,isAdmin,createProduct);
router.get("/allproducts",getAllProducts);
router.put("/updateproduct/:id",protect,isAdmin,updateproduct);
export default router;