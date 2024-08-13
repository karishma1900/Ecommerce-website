const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");



app.use(express.json());
app.use(cors());


// Database connection with mongoodb 
mongoose.connect("mongodb+srv://helotune258:karishma2000@cluster0.p2ys7.mongodb.net/e-commerce");

// API Creation

app.get("/",(req,res)=>{
res.send("Express App is Running")
})

// Image Storage Engine

const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})
// creating upload endpoint for images

app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`hhttp://localhost:${port}/images/${req.file.filename}`

    })

})

// Schema for creating products

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
       type:Number,
       required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },

})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })

})

// creating api for deleting products
app.post('/removeproduct', async(req,res)=>{
    await Product.findOneAndDelete({id: req.body.id});
    console.log("Remove");
    res.json({
        success:true,
        name:req.body.name,
    })
})


// Schema creating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,

    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// creating end point for registring the user
app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,error:"existing user found with same email address"})

    }
    let cart = {};
    for (let i = 0; i<300;i++){
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,

    })
    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})
// creating endpoi nt api for user login
app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong email id"})
    }
})
// creating end point for new collection data
app.get('/newcollection', async(req,res)=>{
let products = await Product.find({});
let newcollection = products.slice(1).slice(-8);

console.log("NewCollection Fetched");
res.send(newcollection);
})
// Creating API for geting all products

app.get('/allproducts',async(req,res)=>{
let products = await Product.find({});
console.log("All Products Fetched");
res.send(products);
})


// creating endpoint for popular women

app.get('/popularinwomen', async(req,res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women is fetched")
    res.send(popular_in_women);
})
// creating middle ware to fetch user
const fetchUser = async(req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authticate using validate  token"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;

            next();
        }catch(error){
           res.status(401).send({errors:"please authenticate using a valid token"})
        }
    }
}

// creating end point for adding producr to cartdarta
app.post('/addtocart', fetchUser, async (req, res) => {

    try {
      // Fetch the user data
      console.log("Added",req.body.itemId);
      let userData = await Users.findOne({ _id: req.user.id });
  
      if (!userData) {
        return res.status(404).send({ errors: "User not found" });
      }
  
      // Ensure itemId is provided in the request body
      if (!req.body.itemId) {
        return res.status(400).send({ errors: "Item ID is required" });
      }
  
      // Update the cartData
      userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;
  
      // Save the updated user document
      await userData.save();
  
      res.send("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).send({ errors: "Internal Server Error" });
    }
  });

//   creating  endpoint to remove product from cart data
app.post('/removefromcart',fetchUser, async(req,res)=>{
    try {
        console.log("removed",req.body.itemId);
        // Fetch the user data
        let userData = await Users.findOne({ _id: req.user.id });
        if(userData.cartData[req.body.itemId]>0)
    
        if (!userData) {
          return res.status(404).send({ errors: "User not found" });
        }
    
        // Ensure itemId is provided in the request body
        if (!req.body.itemId) {
          return res.status(400).send({ errors: "Item ID is required" });
        }
    
        // Update the cartData
        userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) - 1;
    
        // Save the updated user document
        await userData.save();
    
        res.send("removed from  cart");
      } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send({ errors: "Internal Server Error" });
      }
})
  
app.listen(port,(error)=>{
   if(!error){
    console.log("server Running on Port" +port)
   }
   else{
    console.log("Error : " +error)
   }
})
