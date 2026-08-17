import Product from "../Models/Products.js";


export const createProduct=async(req,res)=>{
    try{
        const {title,description,price,originalPrice,images,isNew,onSale,category,sizes,colors,variants,features,rating,reviews}=req.body;

        if(!title ||
            !description ||
            price === undefined ||
            originalPrice === undefined ||
            !images ||
            images.length === 0 ||
            !category ||
            !sizes ||
            sizes.length === 0 ||
            !colors ||
            colors.length === 0 ||
            !variants ||
            variants.length === 0 ||
            !features ||
            features.length === 0){
            return res.status(400).json({message:"Required product fields are missing"});
        }

        for (const variant of variants){
            if(!variant.size || !variant.color || !variant.stock===undefined){
                return res.status(400).json({message:"Each variant must have color, size and stock"});
            }
            if(variant.stock<0){
                return res.status(400).json({message:"Stock cannot be negative"});
            }
            if (!colors.includes(variant.color)) {
                return res.status(400).json({
                  message: `Variant color "${variant.color}" is not available in colors`,
                });
              }
        
              // Check that variant size exists in sizes
              if (!sizes.includes(variant.size)) {
                return res.status(400).json({
                  message: `Variant size "${variant.size}" is not available in sizes`,
                });
              }
        }

        const product=await Product.create({title,description,price,originalPrice,images,isNew,onSale,category,sizes,colors,variants,features,rating,reviews});
        res.status(201).json({message:"Product created successfully",product});
        


    }catch(e){
        res.status(500).json({message:e.message});
    }
}

export const getAllProducts=async(req,res)=>{
    try{
        const products=await Product.find().sort({createdAt:-1});
        res.status(200).json({ message:"Products fetched successfully",products});

    }catch(e){
        res.status(500).json({message:"Error fetching products",error:e.message});
    }
}