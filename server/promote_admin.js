const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const promoteAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'amber0@gmail.com'; // Adjust this if needed
        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`User ${email} promoted to admin successfully.`);
        } else {
            console.log(`User ${email} not found. Make sure you have registered with this email first.`);
        }

        process.exit();
    } catch (err) {
        console.error('Error promoting user:', err.message);
        process.exit(1);
    }
};

promoteAdmin();
