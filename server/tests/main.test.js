// these test case is importand so error can be cached before actual prod gets breaks then u will be understable 


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const app = require('../server'); // Moved up one level
const axios = require('axios');
const http = require('http');
const Product = require('../models/Product');

let server;
const PORT = 5003; // i dont want to crash my server
const API_URL = `http://localhost:${PORT}/api`;

async function startTestServer() {
    process.env.JWT_SECRET = 'testsecret'; // ye fake ha 

    // connection started 
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Real MongoDB Connected');
    }

    server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Test Server running on port ${PORT}`);
        runTests();
    });
}

async function runTests() {
    try {
        console.log('--- Starting Backend Test ---');

        const timestamp = Date.now();

        // 1. Signup User A (Root)
        console.log('\n1. Signing up User A (The Alpha)...');
        const userA = await axios.post(`${API_URL}/auth/signup`, {
            username: `UserA_${timestamp}`,
            email: `usera_${timestamp}@test.com`,
            password: 'password123'
        });
        console.log('User A Signup Success: Look at that referral code brooo', userA.data.user.referralCode);
        const tokenA = userA.data.token;
        const codeA = userA.data.user.referralCode;

        // 2. Signup User B (Referred by A)
        console.log('\n2. Signing up User B');
        const userB = await axios.post(`${API_URL}/auth/signup`, {
            username: `UserB_${timestamp}`,
            email: `userb_${timestamp}@test.com`,
            password: 'password123',
            referralCode: codeA
        });
        console.log('User B Signup Success', userB.data.user.referralCode);
        const tokenB = userB.data.token;
        const codeB = userB.data.user.referralCode;

        // 3. Signup User C (Referred by B)
        console.log('\n3. Signing up User C');
        const userC = await axios.post(`${API_URL}/auth/signup`, {
            username: `UserC_${timestamp}`,
            email: `userc_${timestamp}@test.com`,
            password: 'password123',
            referralCode: codeB
        });
        console.log('User C Signup Success');
        const tokenC = userC.data.token;

        // 4. User C makes a purchase > 1000
        console.log('\n4. User C buying item (Price: 1200, Profit: 200)');

        // Create a product first!
        const product = new Product({
            name: `Golden Goose ${timestamp}`,
            price: 1200,
            profit: 200,
            description: 'Lays golden eggs',
            imageUrl: 'http://example.com/egg.png'
        });
        await product.save();
        console.log('Product created: The Golden Goose is loose!');

        // Expected: 
        // L1 (User B) gets 5% of 200 = 10
        // L2 (User A) gets 1% of 200 = 2

        await axios.post(`${API_URL}/shop/purchase`, {
            productId: product._id
        }, {
            headers: { Authorization: tokenC }
        });
        console.log('Purchase Successful');

        // 5. Verify User B Earnings
        console.log('\n5. Verifying User B earnings');
        const statsB = await axios.get(`${API_URL}/auth/user`, {
            headers: { Authorization: tokenB }
        });
        console.log(`User B Earnings (Direct): ${statsB.data.earnings.direct} (Expected 10)`);
        if (statsB.data.earnings.direct !== 10) throw new Error('User B earnings incorrect!');

        // 6. Verify User A Earnings
        console.log('\n6. Verifying User A earnings...');
        const statsA = await axios.get(`${API_URL}/auth/user`, {
            headers: { Authorization: tokenA }
        });
        console.log(`User A Earnings (Indirect): ${statsA.data.earnings.indirect} (Expected 2)`);
        if (statsA.data.earnings.indirect !== 2) throw new Error('User A earnings incorrect!');

        console.log('\n--- Test Completed Successfully ---');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed: Mission Abort!', error.response ? error.response.data : error.message);
        console.error('Error Details:', error.toJSON ? error.toJSON() : error);
        process.exit(1);
    } finally {
        if (server) server.close();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

startTestServer();
