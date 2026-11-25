if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}

// setup express
const express=require('express');
const { isLoggedIn }=require('./isLogged');
const app=express();
const path=require('path');
const Product=require('./models/product');
const methodOverride=require('method-override');
const Cart=require('./models/cart');
const { cloudinary }=require('./cloudinary');

/// setup for file uploads
const multer=require('multer');
const { storage }=require('./cloudinary');
const upload=multer({storage});

// setup for resuable templates
const ejsMate=require('ejs-mate');

// setup for authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');

//setup for mongoDB
const mongoose=require('mongoose');

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shop")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


app.engine('ejs', ejsMate);

//setup views
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


// setup for post routes
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//setup for update routes
app.use(methodOverride('_method'));

// setup for session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// configure passport
app.use(passport.initialize());
app.use(passport.session());

// configure local strategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

/// setup flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});


// Routes -> users

// Register new User
app.get('/register',(req,res)=>{
    res.render('users/register');
})

app.post('/register',async(req,res)=>{
    const { username, email, password }=req.body;
    // create a user with user , email 
    const newUser=new User({
        username,
        email
    })
     // Register user and hash password
        const registeredUser = await User.register(newUser, password);

    req.flash('success','successfully regitered');
    res.redirect('/products');
})

// Login the regsitered User
app.get('/login',(req,res)=>{
    res.render('users/login');
})
app.post('/login',passport.authenticate('local',{failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome Back to Products');
    res.redirect('/products');
})

// Logout the registered User
app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash('success','Successfully LoggedOut');
        res.redirect('/products');
    });
})



// Routes -> products

// search for products


app.get('/products', async (req, res) => {

    // Get search query
    const search = req.query.search || '';

    // Get page number
    const page = Math.max(1, parseInt(req.query.page) || 1);

    // Products per page
    const limit = 8;

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Search filter
    const filter = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
        ];
    }

    // Fetch products
    const products = await Product.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    // Count total matching products
    const totalProducts = await Product.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    res.render('products/index', {
        products,
        search,
        currentPage: page,
        totalPages
    });
});



// get all products
app.get('/products',async(req,res)=>{
    const products=await Product.find({});
    res.render('products/index',{ products });
})


// add the new products
app.get('/products/new',(req,res)=>{
    res.render('products/new');
})

app.post('/products',upload.array('image',10),async(req,res)=>{
    const product=new Product(req.body);
      product.images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
    await product.save();
    res.redirect('/products');
})

// get the one product by id
app.get('/products/:id',async(req,res)=>{
    const { id }=req.params;
    const product=await Product.findById(id);
    res.render('products/show',{ product });
})

// update the product information
app.get('/products/:id/edit',upload.array('image',10),async(req,res)=>{
    const { id }=req.params;
    const product=await Product.findById(id);
    res.render('products/edit',{ product });
})

app.patch('/products/:id', upload.array('image', 10), async (req, res) => {

    const { id } = req.params;

    const product = await Product.findById(id);

    // Update normal product information
    Object.assign(product, req.body);

    // Get newly uploaded images
    const imgs = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }));

    // Add new images without removing existing images
    product.images.push(...imgs);
    await product.save();
    if(req.body.deleteImages){
       for(let file of req.body.deleteImages){
          await cloudinary.uploader.destroy(file);
       }
    }
    /// delete the seleted images
    if (req.body.deleteImages) {
    const deleteImages = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : [req.body.deleteImages];

    await product.updateOne({
        $pull: {
            images: {
                filename: { $in: deleteImages }
            }
        }
    });
}
    res.redirect('/products');
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        req.flash('error', 'Product not found');
        return res.redirect('/products');
    }

    // Delete images from Cloudinary
    for (let img of product.images) {
        await cloudinary.uploader.destroy(img.filename);
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(id);

    req.flash('success', 'Product deleted successfully');
    res.redirect('/products');
});


/// Routes -> products to cart


app.post('/cart/:productId', async (req, res) => {

    const { productId } = req.params;

    // Find product
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        req.flash('error', 'Product is not available');
        return res.redirect('/products');
    }

    // Check stock
    if (product.stock < 1) {
        req.flash('error', 'Product is out of stock');
        return res.redirect('/products');
    }

    // Find cart
    let cart = await Cart.findOne({
        user: req.user._id
    });

    // Create cart if not found
    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            items: []
        });
    }

    // Check existing product
    const existingItem = cart.items.find(item =>
        item.product.equals(productId)
    );

    if (existingItem) {

        // Check quantity against stock
        if (existingItem.quantity + 1 > product.stock) {
            req.flash('error', 'Insufficient stock');
            return res.redirect('/cart');
        }

        existingItem.quantity++;

    } else {

        // Add new product
        cart.items.push({
            product: productId,
            quantity: 1
        });

    }

    await cart.save();

    req.flash('success', 'Product added to cart');

    res.redirect('/cart');
});

// get the cart of user

app.get('/cart', async (req, res) => {

    const cart = await Cart.findOne({
        user: req.user._id
    }).populate('items.product');

    let total = 0;

    if (cart) {

        for (let item of cart.items) {

            // Ignore deleted products
            if (item.product) {

                const subtotal =
                    item.product.price * item.quantity;

                total += subtotal;
            }
        }
    }

    res.render('cart/index', {
        cart,
        total
    });
});

// update the cart info

app.patch('/cart/:productId',  async (req, res) => {

    const { productId } = req.params;

    const quantity = Number(req.body.quantity);

    // Validate quantity
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
        req.flash('error', 'Invalid quantity');
        return res.redirect('/cart');
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        req.flash('error', 'Product is unavailable');
        return res.redirect('/cart');
    }

    // Validate stock
    if (quantity > product.stock) {
        req.flash('error', 'Insufficient stock');
        return res.redirect('/cart');
    }

    // Find user's cart
    const cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        req.flash('error', 'Cart not found');
        return res.redirect('/products');
    }

    // Find selected item
    const item = cart.items.find(item =>
        item.product.equals(productId)
    );

    if (!item) {
        req.flash('error', 'Product not found in cart');
        return res.redirect('/cart');
    }

    // Update quantity
    item.quantity = quantity;

    await cart.save();

    req.flash('success', 'Cart updated successfully');

    res.redirect('/cart');
});

// delete the cart products

app.delete('/cart/:productId', async (req, res) => {

    const { productId } = req.params;

    const cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        req.flash('error', 'Cart not found');
        return res.redirect('/products');
    }

    // Remove selected product
    cart.items = cart.items.filter(item =>
        !item.product.equals(productId)
    );

    await cart.save();

    req.flash('success', 'Product removed from cart');

    res.redirect('/cart');
});

// delete the cart

app.delete('/cart',async (req, res) => {

    const cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        req.flash('error', 'Cart not found');
        return res.redirect('/products');
    }

    // Remove all cart items
    cart.items = [];

    await cart.save();

    req.flash('success', 'Cart cleared successfully');

    res.redirect('/cart');
});

app.post('/checkout',async(req,res)=>{
     const cart = await Cart.findOne({
        user: req.user._id
    });
    res.render('orders/success');
})


// start the server
app.listen(3000,()=>{
    console.log('Server Running at Port : 3000');
})