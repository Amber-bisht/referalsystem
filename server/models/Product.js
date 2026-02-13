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
    profit: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
