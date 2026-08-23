import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { _id: true },
);

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
    subcategories: { type: [subcategorySchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Category", schema);
