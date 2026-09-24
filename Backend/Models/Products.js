import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    materialCare: {
      type: String,
      default: "",
    },
    specifications: {
      material: { type: String, default: "" },
      bodyDimensions: { type: String, default: "" },
      tableTopDimensions: { type: String, default: "" },
      colour: { type: String, default: "" },
      pattern: { type: String, default: "" },
      foldedDepth: { type: String, default: "" },
      assembly: { type: String, default: "" },
      care: { type: String, default: "" },
      recommendedUse: { type: String, default: "" },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    salePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    colors: {
      type: [String],
      required: true,
    },

    sizes: {
      type: [String],
      required: true,
    },

    variants: {
      type: [variantSchema],
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);