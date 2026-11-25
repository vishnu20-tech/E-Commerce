require('dotenv').config();

const mongoose = require("mongoose");
const Product = require('./models/product');

const MONGO_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shop";

const sampleProducts = [
    {
        name: "Wireless Headphones",
        description: "Bluetooth headphones with noise cancellation and 30-hour battery life.",
        price: 2499,
        images:{
             url: 'https://res.cloudinary.com/bgbskpl1/image/upload/v1795341203/ShopApp/ytf8ffnbo7mnoih2e78i.jpg',
            filename: 'ShopApp/ytf8ffnbo7mnoih2e78i',

        },
        category: "Electronics",
        stock: 50
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches.",
        price: 3499,
        image:'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSORXMmZF5pKJkfX32G0hPcY__31lUJAA0IkEKwlRsr1f88htYbBPZ75gjbEaLyeZaC0ArjZCkTh2fEAp-vJC5vnZbBggn8aaEaKT_X_3SRgcpJb1L2LShsBImHOXEym8fJZTHhwg&usqp=CAc',
        category: "Electronics",
        stock: 25
    },
    {
        name: "Smart Watch",
        description: "Smartwatch with fitness tracking and heart rate monitoring.",
        price: 4999,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPL2Xq8dKg609sgrVxY3UanNuCfZYszznbUP6UjibCbw&s=10',
        category: "Electronics",
        stock: 30
    },
    {
        name: "Cotton T-Shirt",
        description: "Comfortable regular-fit cotton T-shirt.",
        price: 599,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx6wGDhAUJVWYCgnqvJHeepf0wmIOEI7WjP6-xK9pghw&s=10',
        category: "Clothing",
        stock: 100
    },
    {
        name: "Casual Hoodie",
        description: "Premium cotton hoodie for everyday use.",
        price: 1299,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKhUMPq9adPayXTbKZ1wlD_7VNWymy0WbHXJFYu4GvfA&s=10',
        category: "Clothing",
        stock: 40
    },
    {
        name: "Clean Code",
        description: "A handbook of agile software craftsmanship.",
        price: 650,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg_Aj5zOSYFPeZIIk2guIt1A3XTX8RPEmXMhZUyydONg&s=10',
        category: "Books",
        stock: 20
    },
    {
        name: "Java Programming",
        description: "A practical guide to Java programming fundamentals.",
        price: 799,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZXV-2G5mzJtBc_Lgeu5MimLfL-LsEUJLrn7x0qnSHFA&s=10',
        category: "Books",
        stock: 35
    },
    {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with adjustable DPI.",
        price: 899,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo85eRJiIKb86Ex-vD9G7vFibjh_A6RlwmNblZvC2DaA&s=10',
        category: "Accessories",
        stock: 60
    },
    {
        name: "Laptop Backpack",
        description: "Water-resistant backpack with laptop compartment.",
        price: 1599,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCt_TUHQ7WmcnyF5sQZ4PhVgGVy1Dh_16AVc3md9rgUA&s=10',
        category: "Accessories",
        stock: 45
    },
    {
        name: "USB-C Hub",
        description: "Multiport USB-C hub with HDMI and USB 3.0 ports.",
        price: 1199,
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXZMYe4RaQYhT5MJ9y0tV3NOQCO4cHIf3grwf20xrOwg&s=10',
        category: "Accessories",
        stock: 0
    },

    {
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with dedicated graphics and 16GB RAM.",
        price: 74999,
        image: "https://www.google.com/aclk?sa=L&ai=DChsSEwiD5ebH-5aYAxVCVQ8CHckvPCcYACICCAEQARoCdGI&co=1&ase=2&gclid=Cj0KCQiA_P_XBhDvARIsALHjSUW4invz_fFikbd62Z6O_F-IZ04IrFLYzIVRgg1MmM2eJY0czMoewlsaAoPuEALw_wcB&cid=CAAS9QHkaBHke3W04gkmye8r_JNF4r_UwowWL6xUv572N5NeIzmnt1EYekBIrBed08RXmoCfXEJPYX4nTXRQAEAuWTJozfsMFR1nD8ZxWLn94xTJzU0NMVpTs_0aTGgVsUUTQisSgj_I--sr_MuXCL11XJlU5pSRLx2k6r-WkXPywtqqWE5YCZMPvLWg4G8szAXAOhHVMKSStqgSV1VGV7Cwa3F0dXRr02XWZC_IjnTQWjxStQmniyPCysV39TXTN7bk7nhHhir3p4tLjS-z5IeohwgHSHP0_DjnWRWRxHEQbJC8QtboQVm5l225PIEzv8YzATevUHKvPQ&cce=2&category=acrcp_v1_32&sig=AOD64_3ObQCWwLeUPhF2C2WHwLWj1KnXvg&ctype=5&q=&nis=4&ved=2ahUKEwiO_-LH-5aYAxW-h1YBHQgJBWoQ5bgDKAB6BAgIEAs&adurl=",
        category: "Electronics",
        stock: 15
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with deep bass and 12-hour battery life.",
        price: 1999,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG_rTGuq0oJnTOTwlOlMh_kRUawkbNcDWrGOxZCWs4kA&s=10",
        category: "Electronics",
        stock: 35
    },
    {
        name: "Wireless Earbuds",
        description: "True wireless earbuds with touch controls and noise reduction.",
        price: 1499,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB1N48f5FEtyFc-xAczpLbXiHeghdskZ0iqwdRlmTzMw&s=10",
        category: "Electronics",
        stock: 0
    },
    {
        name: "27 Inch Monitor",
        description: "Full HD monitor with a 100Hz refresh rate for work and gaming.",
        price: 11999,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZY7wIDHIRiTZcLZEXk5KLIaiasUNMrm9nyJEsqyuKCw&s=10",
        category: "Electronics",
        stock: 12
    },
    {
        name: "Power Bank",
        description: "20000mAh fast charging power bank with USB-C support.",
        price: 1799,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZLqOFktpDMHFL2YHWVKGmYTHwv1MiEKxwW6x9HvxlxA&s=10",
        category: "Electronics",
        stock: 25
    },
    {
        name: "Denim Jeans",
        description: "Classic slim-fit denim jeans for everyday wear.",
        price: 1499,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzuUt8iPB8RSAiX8ODgAUMoNoFx_-UM5MXpV5iefWLlQ&s=10",
        category: "Clothing",
        stock: 40
    },

];

async function seedDB() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB connected");

        await Product.deleteMany({});
        console.log("Old products deleted");

        await Product.insertMany(sampleProducts);
        console.log("10 products inserted successfully");

    } catch (error) {
        console.log("Seeding error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

seedDB();