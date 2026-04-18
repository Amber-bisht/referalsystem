const mongoose = require('mongoose');

// schema of product
// name
// price
// profit
// description
// imageUrl

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    profit: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    stock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
