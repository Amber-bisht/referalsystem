const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Order = require('../models/Order');
const { productSchema, categorySchema, bannerSchema } = require('../validators/admin.schema');

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
        const orders = await Order.find().populate('user', 'email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/orders/:id
// @desc    Update order details (status, address, phone)
router.put('/orders/:id', async (req, res) => {
    const { status, shippingAddress, phoneNumber } = req.body;
    
    const updateData = {};
    if (status) {
        if (!['Confirmed', 'Processing', 'Delivering', 'Delivered'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }
        updateData.status = status;
    }
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).populate('user', 'email');
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        res.json(order);
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

// Category Management

// @route   GET api/admin/categories
// @desc    Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/categories
// @desc    Add new category
router.post('/categories', async (req, res) => {
    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.issues[0].message });
    }

    const { name } = validation.data;
    try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newCategory = new Category({ name, slug });
        await newCategory.save();
        res.json(newCategory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/categories/:id
// @desc    Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Banner Management

// @route   GET api/admin/banners
// @desc    Get all banners
router.get('/banners', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/banners
// @desc    Add new banner
router.post('/banners', async (req, res) => {
    const validation = bannerSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.issues[0].message });
    }

    try {
        const newBanner = new Banner(validation.data);
        await newBanner.save();
        res.json(newBanner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/banners/:id
// @desc    Update banner
router.put('/banners/:id', async (req, res) => {
    const validation = bannerSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.issues[0].message });
    }

    try {
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { $set: validation.data },
            { new: true }
        );
        res.json(banner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/banners/:id
// @desc    Delete banner
router.delete('/banners/:id', async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Banner removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Product Management

// @route   POST api/admin/products
// @desc    Add new product
router.post('/products', async (req, res) => {
    const validation = productSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.issues[0].message });
    }

    let { name, slug } = validation.data;
    try {
        if (!slug || slug.trim() === "") {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const newProduct = new Product({ ...validation.data, slug });
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
    const validation = productSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.issues[0].message });
    }

    let { name, slug } = validation.data;
    try {
        if (!slug || slug.trim() === "") {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { ...validation.data, slug } },
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
