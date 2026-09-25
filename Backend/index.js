import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./Config/db.js";
import authRouter from "./UseRouter/authRouter.js";
import cartRouter from "./UseRouter/cartRouter.js";
import productRouter from "./UseRouter/productRouter.js";
import adminRouter from "./UseRouter/adminRouter.js";
import categoryRouter from "./UseRouter/categoryRouter.js";
import orderRouter from "./UseRouter/orderRouter.js";
import wishlistRouter from "./UseRouter/wishlistRouter.js";
dotenv.config();
const app=express();
connectDB();

const normalizeOrigin = (value = "") => String(value).trim().replace(/\/+$/, "");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
  .filter(Boolean)
  .map(normalizeOrigin);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header) and exact allowed frontends.
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "3mb" }));
app.use("/api/auth",authRouter);
app.use("/api/cart",cartRouter);
app.use("/api/product",productRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/order", orderRouter);

const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on port http://localhost:${port}`);
});

export default app;
