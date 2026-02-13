require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware 
app.use(cors({
    origin: ["https://luxestream.asprin.dev", "https://referal-earning-system.vercel.app", "http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);

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
