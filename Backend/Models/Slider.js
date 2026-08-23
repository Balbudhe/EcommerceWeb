import mongoose from "mongoose";
const schema=new mongoose.Schema({title:{type:String,required:true},subtitle:{type:String,default:""},image:{type:String,required:true},link:{type:String,default:""},active:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model("Slider",schema);
