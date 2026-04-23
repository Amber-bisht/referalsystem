const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/user/address
// @desc    Add new address
// @access  Private
router.post('/address', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { name, line1, city, state, zipCode, phone, isDefault } = req.body;

        const newAddress = { name, line1, city, state, zipCode, phone, isDefault };

        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        } else if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/user/address/:id
// @desc    Update address
// @access  Private
router.put('/address/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { name, line1, city, state, zipCode, phone, isDefault } = req.body;

        const address = user.addresses.id(req.params.id);
        if (!address) return res.status(404).json({ msg: 'Address not found' });

        if (name) address.name = name;
        if (line1) address.line1 = line1;
        if (city) address.city = city;
        if (state) address.state = state;
        if (zipCode) address.zipCode = zipCode;
        if (phone) address.phone = phone;

        if (isDefault !== undefined) {
            if (isDefault) {
                user.addresses.forEach(addr => addr.isDefault = false);
                address.isDefault = true;
            } else {
                address.isDefault = false;
            }
        }

        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/user/address/:id
// @desc    Delete address
// @access  Private
router.delete('/address/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        
        // If we deleted the default address, set another one as default
        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
