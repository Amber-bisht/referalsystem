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
// @desc    Purchase a product
// @access  Private
router.post('/purchase', auth, async (req, res) => {
    const { productId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const { price, profit } = product;

        const buyer = await User.findById(req.user.id);

        // Save Purchase History regardless of price - as i dont want to waste this info of user 
        buyer.purchaseHistory.push({
            productId: product._id,
            productName: product.name,
            price: price
        });
        await buyer.save();

        if (price <= 1000) {
            return res.json({ msg: `Purchase successful. No earnings distributed (Price ₹${price} <= ₹1000).` });
        }

        // Level 1: Direct Parent - 1st 
        if (buyer.referredBy) {
            const level1Parent = await User.findById(buyer.referredBy);
            if (level1Parent) {
                const level1Earnings = profit * 0.05;
                level1Parent.earnings.direct += level1Earnings;
                level1Parent.earnings.total += level1Earnings;
                await level1Parent.save();

                // Level 2: Parent of Parent
                if (level1Parent.referredBy) {
                    const level2Parent = await User.findById(level1Parent.referredBy);
                    if (level2Parent) {
                        const level2Earnings = profit * 0.01;
                        level2Parent.earnings.indirect += level2Earnings;
                        level2Parent.earnings.total += level2Earnings;
                        await level2Parent.save();
                    }
                }
            }
        }

        // History saved above 

        res.json({ msg: 'Purchase successful. Earnings distributed if applicable.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
