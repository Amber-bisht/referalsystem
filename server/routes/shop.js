const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

// @route   GET api/shop/banners
// @desc    Get all active banners
// @access  Public
router.get('/banners', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/shop/categories
// @desc    Get all categories for the store
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/shop/products
// @desc    Get all products
// @access  Public
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const mongoose = require('mongoose');

// @route   GET api/shop/products/:id
// @desc    Get product by ID or Slug
// @access  Public
router.get('/products/:id', async (req, res) => {
    try {
        const query = mongoose.isValidObjectId(req.params.id) 
            ? { $or: [{ _id: req.params.id }, { slug: req.params.id }] }
            : { slug: req.params.id };
            
        const product = await Product.findOne(query).populate('category');
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const Order = require('../models/Order');

// @route   GET api/shop/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
