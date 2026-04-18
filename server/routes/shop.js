const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   GET api/shop/products
// @desc    Get all products
// @access  Private
router.get('/products', auth, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/shop/purchase
// @desc    Purchase a product (DEPRECATED - Use payment flow)
// @access  Private
// router.post('/purchase', auth, async (req, res) => {
//     ...
// });

module.exports = router;
