const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Product = require('../models/Product');

// Apply auth and admin middleware to all routes in this file
router.use(auth, admin);

// @route   GET api/admin/users
// @desc    Get all users with their stats
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/orders
// @desc    Get all orders across all users
router.get('/orders', async (req, res) => {
    try {
        const users = await User.find().select('email purchaseHistory');
        let allOrders = [];
        users.forEach(user => {
            user.purchaseHistory.forEach(order => {
                allOrders.push({
                    ...order.toObject(),
                    user: {
                        id: user._id,
                        email: user.email
                    }
                });
            });
        });
        // Sort by date descending
        allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allOrders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/admin/orders/:userId/:purchaseId
// @desc    Update order status
router.get('/orders/:userId/:purchaseId', async (req, res) => {
    const { userId, purchaseId } = req.params;
    const { status } = req.query; // Using query for simplicity in this specific request

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const purchase = user.purchaseHistory.id(purchaseId);
        if (!purchase) return res.status(404).json({ msg: 'Purchase not found' });

        purchase.status = status;
        await user.save();

        res.json({ msg: 'Order status updated', status: purchase.status });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/withdrawals
// @desc    Get all redemption history
router.get('/withdrawals', async (req, res) => {
    try {
        const users = await User.find().select('email withdrawalHistory');
        let allWithdrawals = [];
        users.forEach(user => {
            user.withdrawalHistory.forEach(w => {
                allWithdrawals.push({
                    ...w.toObject(),
                    user: {
                        id: user._id,
                        email: user.email
                    }
                });
            });
        });
        allWithdrawals.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allWithdrawals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Product Management

// @route   POST api/admin/products
// @desc    Add new product
router.post('/products', async (req, res) => {
    const { name, price, originalPrice, profit, description, imageUrl, stock } = req.body;
    try {
        const newProduct = new Product({ name, price, originalPrice, profit, description, imageUrl, stock: stock || 0 });
        await newProduct.save();
        res.json(newProduct);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/products/:id
// @desc    Update product
router.put('/products/:id', async (req, res) => {
    const { name, price, originalPrice, profit, description, imageUrl, stock } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { name, price, originalPrice, profit, description, imageUrl, stock: stock || 0 } },
            { new: true }
        );
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/products/:id
// @desc    Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
