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

// Database Connection (Global Cache for Serverless)
const MONGO_URI = process.env.MONGO_URI;
let cachedConnection = null;

async function connectToDatabase() {
    if (cachedConnection) {
        return cachedConnection;
    }
    
    if (!MONGO_URI) {
        console.error('CRITICAL: Missing MONGO_URI in environment variables.');
        return;
    }

    try {
        console.log('Establishing new MongoDB connection...');
        cachedConnection = await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        return cachedConnection;
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        throw err;
    }
}

// Ensure database connection for API routes
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Server Startup
const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
