const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const Category = require('./models/Category');

const categories = [
    { name: 'Games', slug: 'games' },
    { name: 'Consoles', slug: 'consoles' },
    { name: 'Anime Movies', slug: 'anime-movies' },
    { name: 'Figurines', slug: 'figurines' }
];

const products = [
    // Games
    {
        name: 'Spider-Man 2 (PS5 CD)',
        slug: 'spiderman-2-ps5',
        price: 4999,
        originalPrice: 5999,
        commissionPercentage: 10,
        description: 'Experience the next chapter in the Marvel\'s Spider-Man universe on PS5.',
        imageUrl: 'https://m.media-amazon.com/images/I/81sh9M-YV3L._SL1500_.jpg',
        stock: 15,
        categoryName: 'Games'
    },
    {
        name: 'Elden Ring (PS4/PS5 CD)',
        slug: 'elden-ring',
        price: 3499,
        originalPrice: 3999,
        commissionPercentage: 10,
        description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
        imageUrl: 'https://m.media-amazon.com/images/I/81gBy767iDL._SL1500_.jpg',
        stock: 20,
        categoryName: 'Games'
    },
    {
        name: 'The Legend of Zelda: Tears of the Kingdom',
        slug: 'zelda-totk',
        price: 4500,
        originalPrice: 4999,
        commissionPercentage: 10,
        description: 'An epic adventure across the land and skies of Hyrule.',
        imageUrl: 'https://m.media-amazon.com/images/I/818H5N1mU7L._SL1500_.jpg',
        stock: 12,
        categoryName: 'Games'
    },
    // Consoles
    {
        name: 'PlayStation 5 Console (Disc Edition)',
        slug: 'ps5-disc',
        price: 49990,
        originalPrice: 54990,
        commissionPercentage: 5,
        description: 'Lightning-fast loading with an ultra-high speed SSD.',
        imageUrl: 'https://m.media-amazon.com/images/I/51051HiS9oL._SL1500_.jpg',
        stock: 5,
        categoryName: 'Consoles'
    },
    {
        name: 'Xbox Series X',
        slug: 'xbox-series-x',
        price: 48990,
        originalPrice: 52990,
        commissionPercentage: 5,
        description: 'The fastest, most powerful Xbox ever.',
        imageUrl: 'https://m.media-amazon.com/images/I/61JG6lo960L._SL1500_.jpg',
        stock: 8,
        categoryName: 'Consoles'
    },
    {
        name: 'PlayStation 4 Slim 1TB',
        slug: 'ps4-slim',
        price: 24990,
        originalPrice: 29990,
        commissionPercentage: 8,
        description: 'The world\'s bestselling console has a new look.',
        imageUrl: 'https://m.media-amazon.com/images/I/71YvC5p4tXL._SL1500_.jpg',
        stock: 10,
        categoryName: 'Consoles'
    },
    // Anime Movies
    {
        name: 'Your Name (4K Blu-ray CD)',
        slug: 'your-name-anime',
        price: 1299,
        originalPrice: 1999,
        commissionPercentage: 15,
        description: 'Two strangers find themselves linked in a bizarre way.',
        imageUrl: 'https://m.media-amazon.com/images/I/91M1S8S5V6L._SL1500_.jpg',
        stock: 50,
        categoryName: 'Anime Movies'
    },
    {
        name: 'Spirited Away Special Edition',
        slug: 'spirited-away',
        price: 1499,
        originalPrice: 2499,
        commissionPercentage: 15,
        description: 'Studio Ghibli\'s Academy Award-winning masterpiece.',
        imageUrl: 'https://m.media-amazon.com/images/I/81mD0X2V6CL._SL1500_.jpg',
        stock: 30,
        categoryName: 'Anime Movies'
    },
    // Figurines
    {
        name: 'Naruto Uzumaki Sage Mode Figurine',
        slug: 'naruto-sage-fig',
        price: 2999,
        originalPrice: 4500,
        commissionPercentage: 12,
        description: 'Highly detailed 7-inch figurine of Naruto in Sage Mode.',
        imageUrl: 'https://m.media-amazon.com/images/I/61k1Y8f9uHL._SL1500_.jpg',
        stock: 25,
        categoryName: 'Figurines'
    },
    {
        name: 'Goku Super Saiyan Blue Figurine',
        slug: 'goku-ssj-blue',
        price: 3499,
        originalPrice: 4999,
        commissionPercentage: 12,
        description: 'Collectible figure from the Dragon Ball Super series.',
        imageUrl: 'https://m.media-amazon.com/images/I/61D19Y-YV3L._SL1500_.jpg',
        stock: 15,
        categoryName: 'Figurines'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Seed Categories
        const categoryMap = {};
        for (const catData of categories) {
            let cat = await Category.findOne({ slug: catData.slug });
            if (!cat) {
                cat = new Category(catData);
                await cat.save();
                console.log(`Created Category: ${cat.name}`);
            } else {
                console.log(`Category exists: ${cat.name}`);
            }
            categoryMap[cat.name] = cat._id;
        }

        // 2. Seed Products
        for (const prodData of products) {
            const { categoryName, ...rest } = prodData;
            const categoryId = categoryMap[categoryName];

            let existing = await Product.findOne({ slug: rest.slug });
            if (!existing) {
                const newProd = new Product({
                    ...rest,
                    category: categoryId
                });
                await newProd.save();
                console.log(`Added Product: ${newProd.name}`);
            } else {
                // Update existing product details and image
                existing.name = rest.name;
                existing.price = rest.price;
                existing.originalPrice = rest.originalPrice;
                existing.description = rest.description;
                existing.imageUrl = rest.imageUrl;
                existing.stock = rest.stock;
                existing.category = categoryId;
                await existing.save();
                console.log(`Updated Product: ${existing.name}`);
            }
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
