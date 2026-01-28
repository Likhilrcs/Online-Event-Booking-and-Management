const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function createAdmin() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not set in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to DB...');

        const adminData = {
            name: 'admin',
            email: 'admin@admin.com',
            password: 'admin@2004',
            role: 'admin',
            phone: '0000000000',
            isVerified: true
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email: adminData.email });
        if (existingUser) {
            console.log('User already exists, updating password and role...');
            existingUser.password = adminData.password;
            existingUser.role = adminData.role;
            existingUser.name = adminData.name;
            await existingUser.save();
            console.log('Admin user updated successfully.');
        } else {
            await User.create(adminData);
            console.log('Admin user created successfully.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

createAdmin();
