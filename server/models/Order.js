const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    productName: { type: String, required: true },
    productImage: { type: String },
    amount: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    paymentMethod: { 
        type: String, 
        enum: ['Razorpay', 'Wallet'], 
        required: true 
    },
    paymentId: { type: String }, // Razorpay Payment ID or Internal Transaction ID
    razorpayOrderId: { type: String },
    status: { 
        type: String, 
        enum: ['Confirmed', 'Processing', 'Delivering', 'Delivered'], 
        default: 'Confirmed' 
    },
    shippingAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
