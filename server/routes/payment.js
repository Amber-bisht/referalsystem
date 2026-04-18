const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST api/payment/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
    const { productId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const options = {
            amount: product.price * 100, // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_order_${Math.floor(Date.now() / 1000)}`,
            notes: {
                productId: product._id.toString(),
                userId: req.user.id
            }
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payment/verify
// @desc    Verify payment and distribute commissions
// @access  Private
router.post('/verify', auth, async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        productId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ msg: 'Product not found' });
            }

            const buyer = await User.findById(req.user.id);
            if (!buyer) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Save Purchase History
            buyer.purchaseHistory.push({
                productId: product._id,
                productName: product.name,
                price: product.price,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            });
            await buyer.save();

            // Commission Distribution Logic
            if (product.price > 1000) {
                const { profit } = product;

                // Level 1: Direct Parent
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
            }

            res.json({ success: true, msg: 'Payment verified and transaction completed.' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    } else {
        res.status(400).json({ success: false, msg: 'Invalid signature' });
    }
});

// @route   POST api/payment/withdraw
// @desc    Process fake withdrawal (Redeem Coupon)
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
    const { amount } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const currentBalance = user.earnings.total - (user.earnings.withdrawn || 0);

        if (amount > currentBalance) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Deduct by incrementing withdrawn amount
        user.earnings.withdrawn = (user.earnings.withdrawn || 0) + amount;

        // Record in history for admin tracking
        user.withdrawalHistory.push({
            amount,
            brand: req.body.brand || 'Voucher',
            couponCode: Math.floor(100000 + Math.random() * 900000).toString(),
            date: new Date()
        });

        await user.save();

        res.json({ success: true, msg: 'Withdrawal successful', newBalance: user.earnings.total - user.earnings.withdrawn });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
