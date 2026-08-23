import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: { type: Number, required: true, min: 1, max: 100 },
    minimumOrder: { type: Number, default: 0 },
    expiryDate: { type: Date, default: null },
    active: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export default mongoose.model("Coupon", schema);
