import mongoose from "mongoose";


const orderItemSchema=new mongoose.Schema({
    
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        size: {
          type: String,
          default: "",
        },
        color: {
          type: String,
          default: "",
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
      { _id: false }
);
const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    items:{
        type:[orderItemSchema],
        default:[],
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    subtotal: {
      type: Number,
      required: true,
    },

    shippingFee: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    razorpayOrderId: {
      type: String,
      sparse: true,
      unique: true,
    },

    razorpayPaymentId: {
      type: String,
      sparse: true,
      unique: true,
    },

    razorpaySignature: {
      type: String,
      select: false,
    },

    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    shiprocketOrderId: {
      type: String,
      sparse: true,
    },

    shiprocketShipmentId: {
      type: String,
      sparse: true,
    },

    awbCode: {
      type: String,
      default: "",
    },

    courierName: {
      type: String,
      default: "",
    },

    trackingUrl: {
      type: String,
      default: "",
    },

    shipmentStatus: {
      type: String,
      default: "",
    },
 
}, {timestamps:true});

const Order=mongoose.model("Order", orderSchema);

export default Order;
