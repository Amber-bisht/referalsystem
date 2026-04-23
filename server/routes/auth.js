const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { signupSchema, loginSchema } = require('../validators/auth.schema');

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        // Validate request body
        const validation = signupSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ msg: validation.error.issues[0].message });
        }

        const { email, password, phone, address, referralCode } = validation.data;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        let referredBy = null;
        if (referralCode) {
            const parent = await User.findOne({ referralCode });
            if (!parent) {
                return res.status(400).json({ msg: 'Invalid referral code' });
            }
            if (parent.directReferrals.length >= 8) {
                return res.status(400).json({ msg: 'Referral limit reached for this code (Max 8)' });
            }
            referredBy = parent._id;
        }

        // Generate unique referral code for new user using cryptographically secure random bytes
        const newReferralCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        user = new User({
            email,
            password,
            phone,
            address,
            referralCode: newReferralCode,
            referredBy
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Update parent if applicable
        if (referredBy) {
            await User.findByIdAndUpdate(referredBy, { $push: { directReferrals: user._id } });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email, referralCode: user.referralCode } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ msg: validation.error.issues[0].message });
    }

    const { email, password } = validation.data;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email, referralCode: user.referralCode } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile (phone, address)
// @access  Private
router.put('/profile', require('../middleware/auth'), async (req, res) => {
    const { phone, address } = req.body;
    try {
        const updateFields = {};
        if (phone) updateFields.phone = phone;
        if (address) updateFields.address = address;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
