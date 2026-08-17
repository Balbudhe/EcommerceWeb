import Order from "../Models/Order.js";


export const createOrder=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {items,shippingAddress,paymentMethod}=req.body;

        if(!items || items.length===0){{
            return res.status(400).json({message:"No items in the order"});
        }}
        if(!shippingAddress){
            return res.status(400).json({message:"Shipping address is required"});
        }

        let subtotal=0;
        const orderItems=[];

        for(const item of items){
            const product=await Prod
        };
    }catch(e){
        res.status(500).json({message:e.message});
    }
};