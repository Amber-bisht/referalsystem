const mongoose = require('mongoose');

// usEr schema 
// username
// emaiL
// password
// referralCode
// referredBy
// directReferrals
// earnings
// purchaseHistory
// createdAa

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    directReferrals: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        validate: {
            validator: function (val) {
                return val.length <= 8;
            },
            message: 'Maximum of 8 direct referrals allowed.'
        }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    earnings: {
        direct: { type: Number, default: 0 },
        indirect: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        withdrawn: { type: Number, default: 0 }
    },
    purchaseHistory: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        price: Number,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        status: { type: String, default: 'Payment Successful' },
        date: { type: Date, default: Date.now }
    }],
    withdrawalHistory: [{
        amount: Number,
        couponCode: String,
        brand: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);