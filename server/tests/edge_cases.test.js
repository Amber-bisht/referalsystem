// these test case is importand so error can be cached before actual prod gets breaks then u will be understable 

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const app = require('../server');
const axios = require('axios');
const http = require('http');
const User = require('../models/User');
const Product = require('../models/Product');

let server;
const PORT = 5002; // ye differnt port ha to avloid crash
const API_URL = `http://localhost:${PORT}/api`;

const startTestServer = async () => {

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connection done ');
    }

    return new Promise((resolve) => {
        server = app.listen(PORT, () => {
            console.log(`Test Server running on port ${PORT}`);
            resolve();
        });
    });
};

const runTests = async () => {
    try {
        await startTestServer();
        console.log('--- Starting Edge Case Tests # lets gooo  ---');

        const timestamp = Date.now();
        const rootEmail = `root_${timestamp}@test.com`;

        // Setup: Create Root User
        const rootRes = await axios.post(`${API_URL}/auth/signup`, {
            username: `Root_${timestamp}`, email: rootEmail, password: 'password'
        });
        const rootId = rootRes.data.user.id;
        const rootCode = rootRes.data.user.referralCode;

        // Test 1: Max 8 Referrals
        console.log('\nTest 1: Enforcing Max 8 Referrals (No hoarders allowed!)...');
        // Create 8 children
        for (let i = 0; i < 8; i++) {
            await axios.post(`${API_URL}/auth/signup`, {
                username: `Ref${i}_${timestamp}`, email: `ref${i}_${timestamp}@test.com`, password: 'password', referralCode: rootCode
            });
        }

        // Attempt 9th referral - mat milo tum 
        try {
            await axios.post(`${API_URL}/auth/signup`, {
                username: `Ref9_${timestamp}`, email: `ref9_${timestamp}@test.com`, password: 'password', referralCode: rootCode
            });
            console.error('FAILED: Allowed 9th referral');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('PASSED: Blocked 9th referral');
            } else {
                console.error('FAILED: Unexpected error on 9th referral', err.message);
                process.exit(1);
            }
        }

        // Test 2: Purchase Threshold (<= 1000)
        console.log('\nTest 2: Commission Threshold (<= 1000) (Penny pinching)...');
        // Structure: Root -> Ref0 (L1) -> Child (L2 relative to Root)
        // Login Ref0 to get their ID/Code
        // Actually we just need Ref0's ID to check earnings.
        const ref0 = await User.findOne({ email: `ref0_${timestamp}@test.com` });

        // Create Child referred by Ref0
        const childRes = await axios.post(`${API_URL}/auth/signup`, {
            username: `Child_${timestamp}`, email: `child_${timestamp}@test.com`, password: 'password', referralCode: ref0.referralCode
        });
        const childToken = childRes.data.token;

        // Create Cheap Product
        const cheapProduct = new Product({
            name: `Cheapskate Deal ${timestamp}`,
            price: 1000,
            profit: 500
        });
        await cheapProduct.save();

        // Purchase exactly 1000 (Profit 500) -> Should NOT trigger commission
        await axios.post(`${API_URL}/shop/purchase`, {
            productId: cheapProduct._id
        }, { headers: { Authorization: childToken } });

        // Force a small delay or fetch fresh user data
        const ref0Check1 = await User.findById(ref0._id);
        if (ref0Check1.earnings.direct === 0) {
            console.log('PASSED: No commission for purchase of 1000 (Sad trombone)');
        } else {
            console.error(`FAILED: Commission given for 1000: ${ref0Check1.earnings.direct} (Free money?)`);
            process.exit(1);
        }

        // Test 3: Purchase Threshold (> 1000)
        console.log('\nTest 3: Commission Valid (> 1000) (Big spender!)...');

        // Create Expensive Product
        const expensiveProduct = new Product({
            name: `High Roller Item ${timestamp}`,
            price: 1001,
            profit: 500
        });
        await expensiveProduct.save();

        // Purchase 1001 (Profit 500) -> Should trigger commission
        // L1 (Ref0): 5% of 500 = 25
        // L2 (Root): 1% of 500 = 5
        await axios.post(`${API_URL}/shop/purchase`, {
            productId: expensiveProduct._id
        }, { headers: { Authorization: childToken } });

        const ref0Check2 = await User.findById(ref0._id);
        const rootCheck2 = await User.findById(rootId);

        if (ref0Check2.earnings.direct === 25) {
            console.log('PASSED: Direct commission correct (25)');
        } else {
            console.error(`FAILED: Direct commission incorrect: ${ref0Check2.earnings.direct} `);
        }

        if (rootCheck2.earnings.indirect === 5) {
            console.log('PASSED: Indirect commission correct (5)');
        } else {
            console.error(`FAILED: Indirect commission incorrect: ${rootCheck2.earnings.indirect}`);
        }

        console.log('\n--- All Edge Case Tests Passed ---');
        process.exit(0);

    } catch (error) {
        console.error('Test Suite Failed: Everything is broken!', error);
        process.exit(1);
    } finally {
        if (server) server.close();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

runTests();
