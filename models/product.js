const mongoose=require('mongoose');
const Schema=mongoose.Schema;


//design schema for products
const ProductSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    images:[{
        url:String,
        filename:String
    }
    ],
    price:{
        type:Number,
        required:true,
        min:0
    },
    category:{
        type:String,
    },
    stock:{
        type:Number,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
},{timestamps:true});


module.exports=mongoose.model('Product',ProductSchema);