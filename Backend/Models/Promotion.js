import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount: { type: Number, required: true, min: 1, max: 100 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Promotion", promotionSchema);
