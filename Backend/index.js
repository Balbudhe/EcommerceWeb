import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./Config/db.js";
import authRouter from "./UseRouter/authRouter.js";
import cartRouter from "./UseRouter/cartRouter.js";
import productRouter from "./UseRouter/productRouter.js";
import adminRouter from "./UseRouter/adminRouter.js";
import orderRouter from "./UseRouter/orderRouter.js";
import wishlistRouter from "./UseRouter/wishlistRouter.js";
dotenv.config();
const app=express();
connectDB();

app.use(cors({origin:process.env.FRONTEND_URL||"http://localhost:5173",credentials:true}));
app.use(express.json({ limit: "3mb" }));
app.use("/api/auth",authRouter);
app.use("/api/cart",cartRouter);
app.use("/api/product",productRouter);
app.use("/api/admin", adminRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/order", orderRouter);
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

export default app;
