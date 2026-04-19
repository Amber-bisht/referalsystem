const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createOrderSchema, verifyPaymentSchema, withdrawSchema } = require('../validators/payment.schema');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST api/payment/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.errors[0].message });
    }

    const { productId } = validation.data;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        if (product.stock <= 0) {
            return res.status(400).json({ msg: 'This voucher is currently out of stock' });
        }

        const options = {
            amount: product.price * 100, // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_order_${crypto.randomBytes(3).toString('hex')}`,
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
    const validation = verifyPaymentSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.errors[0].message });
    }

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        productId
    } = validation.data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({ success: false, msg: 'Invalid signature' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const product = await Product.findById(productId).session(session);
        if (!product) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Product not found' });
        }

        const buyer = await User.findById(req.user.id).session(session);
        if (!buyer) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate unique voucher code
        const voucherCode = `${product.name.substring(0, 3).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Save Purchase History
        buyer.purchaseHistory.push({
            productId: product._id,
            productName: product.name,
            productImage: product.imageUrl,
            price: product.price,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            voucherCode
        });
        await buyer.save({ session });

        // Decrement Stock
        product.stock = Math.max(0, product.stock - 1);
        await product.save({ session });

        // Commission Distribution Logic
        if (product.price >= 10 && product.commissionPercentage > 0) {
            const directEarnings = product.price * (product.commissionPercentage / 100);
            const indirectEarnings = directEarnings * 0.10;

            // Level 1: Direct Parent
            if (buyer.referredBy) {
                const level1Parent = await User.findById(buyer.referredBy).session(session);
                if (level1Parent) {
                    level1Parent.earnings.direct += directEarnings;
                    level1Parent.earnings.total += directEarnings;
                    await level1Parent.save({ session });

                    // Level 2: Parent of Parent
                    if (level1Parent.referredBy) {
                        const level2Parent = await User.findById(level1Parent.referredBy).session(session);
                        if (level2Parent) {
                            level2Parent.earnings.indirect += indirectEarnings;
                            level2Parent.earnings.total += indirectEarnings;
                            await level2Parent.save({ session });
                        }
                    }
                }
            }
        }

        await session.commitTransaction();
        res.json({ success: true, msg: 'Payment verified and transaction completed.' });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        session.endSession();
    }
});

// @route   POST api/payment/withdraw
// @desc    Process fake withdrawal (Redeem Coupon)
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
    const validation = withdrawSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.errors[0].message });
    }

    const { amount, brand } = validation.data;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.user.id).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'User not found' });
        }

        const currentBalance = user.earnings.total - (user.earnings.withdrawn || 0);

        if (amount > currentBalance) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Deduct by incrementing withdrawn amount
        user.earnings.withdrawn = (user.earnings.withdrawn || 0) + amount;

        // Generate a cryptographically secure voucher code
        const brandTag = (brand || 'VOUCHER').substring(0, 3).toUpperCase();
        const code = crypto.randomBytes(5).toString('hex').toUpperCase();
        const couponCode = `GIFT-${brandTag}-${code}`;

        // Record in history for admin tracking
        user.withdrawalHistory.push({
            amount,
            brand: brand || 'Voucher',
            couponCode: couponCode,
            date: new Date()
        });

        await user.save({ session });

        await session.commitTransaction();

        res.json({ 
            success: true, 
            msg: 'Withdrawal successful', 
            couponCode: couponCode,
            newBalance: user.earnings.total - user.earnings.withdrawn 
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        session.endSession();
    }
});

module.exports = router;
