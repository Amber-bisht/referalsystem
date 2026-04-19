const mongoose = require('mongoose');

// schema of product
// name
// price
// profit
// description
// imageUrl

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    commissionPercentage: { type: Number, required: true, default: 10, min: 1, max: 50 },
    description: { type: String },
    imageUrl: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    stock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
