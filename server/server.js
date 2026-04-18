const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.MONGO_URI) {
    console.warn('WARNING: MONGO_URI is not defined in .env file!');
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware 
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://api.referral.amberbisht.me",
        "https://referal.amberbisht.me",
        process.env.FRONTEND_URL
    ],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Database Connection
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
