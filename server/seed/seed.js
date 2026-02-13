const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// if db is empty i run this script so product gets saved in 
// db as total hardcoded looks bad lol

const products = [
    {
        name: 'Premium Watch',
        price: 1200,
        profit: 200,
        description: 'Elegant timepiece for any occasion.',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRKVlVohhI3k4G1eQ69GqsqEA89DAGQiRRxltN5_9Z8rNvFR5SvABeN4dnCZxbEgAtBq2jIW4tXT_M'
    },
    {
        name: 'Wireless Earbuds',
        price: 800,
        profit: 100,
        description: 'Crystal clear sound with noise cancellation.',
        imageUrl: 'https://www.leafstudios.in/cdn/shop/files/1_6b54ff34-acdd-40e6-a08a-f2bfa33a1c7a_800x.png?v=1718706988'
    },
    {
        name: 'Leather Bag',
        price: 1500,
        profit: 300,
        description: 'Genuine leather, spacious and stylish.',
        imageUrl: 'https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/AUGUST/28/aPnJ2QOF_c09ea20cbf62415cbddc6c49d3dc99f5.jpg'
    },
    {
        name: 'Designer Sunglasses',
        price: 500,
        profit: 50,
        description: 'UV protection with a modern frame.',
        imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSHgDFsPH-xeizxqLbJXRSXL-Jj0_Wt3xPxysx8xSF-swm4Bm1l'
    },
    {
        name: 'Smart Phone Pro',
        price: 65000,
        profit: 5000,
        description: 'Top-tier performance and camera.',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKlpox488T6I75L8djnqWg3AVN96xVEdRytw&s'
    },
    {
        name: 'Dyson Airwrap',
        price: 45000,
        profit: 4000,
        description: 'Style your hair with air, no extreme heat.',
        imageUrl: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/leap-petite-global/markets/singapore/products/hair-care/supersonic/0_Primary-800x1200_SSNural-BlueTopaz_attachments_case.png'
    },
    {
        name: 'Gold platted ring',
        price: 300000,
        profit: 3500,
        description:'gold platted ring shiny more than your face',
        imageUrl:'https://img.freepik.com/free-psd/solitaire-diamond-engagement-ring-symbol-love-commitment_191095-83418.jpg?semt=ais_user_personalization&w=740&q=80'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        await Product.insertMany(products);
        console.log('Seeded products with User-Provided URLs');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
