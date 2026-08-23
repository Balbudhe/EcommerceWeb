import Cart from "../Models/Cart.js";

// function itemKey(item) {
//   return `${item.productId}-${item.size || ""}-${item.color || ""}`;
// }

// function mapCartForFrontend(cart) {
//   if (!cart) return { items: [] };
//   return {
//     _id: cart._id,
//     userId: cart.userId,
//     items: (cart.items || []).map((item) => ({
//       key: itemKey(item),
//       id: item.productId,
//       productId: item.productId,
//       name: item.name,
//       price: item.price,
//       image: item.image,
//       size: item.size,
//       color: item.color,
//       quantity: item.quantity,
//     })),
//   };
// }

export const addToCart = async (req, res) => {
  try {
    const {userId,productId,name,price,image,size,color,quantity=1} = req.body;
    if(!userId || !productId || !name || price === undefined)
    {
        return res.status(400).json({
            message: "Required product information is missing",
          });
    }

    let cart = await Cart.findOne({userId});
    if(!cart){
        cart=await Cart.create({userId,items:[{productId,name,price,image,size,color,quantity}] });

        return res.status(200).json({
            message: "Item added to cart successfully",
            cart: cart,
        });
    }

    const existingitem=cart.items.find((item)=>String(item.productId) === String(productId) && item.size===(size || "") && item.color===(color || ""));
    if(existingitem){
        existingitem.quantity+=quantity;
    }else{
        cart.items.push({productId,name,price,image,size:size || "",color:color || "",quantity});
    }

    await cart.save();
    return res.status(200).json({
        message: "Item added to cart successfully",
        cart: cart,
    });
  }catch(e){
    console.error("addToCart error:",e);
    return res.status(500).json({
      message: "Failed to add item to cart",
      error: e.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
   const {userId}=req.params;

   const cart=await Cart.findOne({userId});
   if(!cart){
    return res.status(200).json({
        message: "Cart is empty",
        items: [],
    });
   }
   return res.status(200).json({
    message: "Cart fetched successfully",
    cart: cart,
    items: cart.items,
   });
  } catch (e) {
    console.error("getCart error:", e);
    return res.status(500).json({
      message: "Failed to get cart",
      error: e.message,
    });
  }
};
export const updateQuantity=async(req,res)=>{
    try{
        const {userId,productId}=req.params;
        const {quantity , size= "", color= ""}=req.body;

       if(quantity <0){
        return res.status(400).json({
            message: "Quantity cannot be negative",
        });
       }

       const cart=await Cart.findOne({userId});
       if(!cart){
        return res.status(404).json({
            message: "Cart not found",
        });
        }

        const item=cart.items.find((item)=>String(item.productId) === String(productId) && item.size===size && item.color===color);
        if(!item){
            return res.status(404).json({
                message: "Item not found in cart",
            });
        }
        item.quantity=quantity;
        await cart.save();
        return res.status(200).json({
            message: "Quantity updated successfully",
            cart: cart,
            items: cart.items,
        });


    }catch(e){
        console.error("updateQuantity error:",e);
        return res.status(500).json({
            message: "Failed to update quantity",
            error: e.message,
        });
    }
};


export const removeItem=async(req,res)=>{
    try{
        const {userId,productId}=req.params;
        const {size= "", color= ""}=req.body;

        const cart=await Cart.findOne({userId});

        if(!cart){
            return res.status(404).json({
                message: "Cart not found",
            });
        }

       cart.items=cart.items.filter((item)=>String(item.productId) !== String(productId) || item.size!==size || item.color!==color);

       await cart.save();
       return res.status(200).json({
        message: "Item removed from cart successfully",
        cart: cart,
        items: cart.items,
       });
    }catch(e){
        console.error("removeItem error:",e);
        return res.status(500).json({
            message: "Failed to remove item",
            error: e.message,
        });
    }
};

export const clearCart=async(req,res)=>{
    try{
        const {userId}=req.params;
        const cart=await Cart.findOne({userId});
        if(!cart){
            return res.status(200).json({
                items: [],
              });
        }
        cart.items=[];
        await cart.save();
        return res.status(200).json({
            message: "Cart cleared successfully",
            cart: cart,
            items: cart.items,
        });
    }catch(e){
        console.error("clearCart error:",e);
        return res.status(500).json({
            message: "Failed to clear cart",
            error: e.message,
        });
    }
}
