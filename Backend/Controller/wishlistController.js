import mongoose from "mongoose";
import Product from "../Models/Products.js";
import Wishlist from "../Models/Wishlist.js";

const response = (wishlist) => ({
  productIds: (wishlist?.productIds || []).map(String),
});

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    res.json(response(wishlist));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    if (!(await Product.exists({ _id: productId }))) {
      return res.status(404).json({ message: "Product not found" });
    }
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { productIds: productId } },
      { new: true, upsert: true, runValidators: true },
    );
    res.json(response(wishlist));
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist", error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { productIds: req.params.productId } },
      { new: true },
    );
    res.json(response(wishlist));
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist", error: error.message });
  }
};
