const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function testLogin() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const email = 'admin@example.com';
        const password = 'password123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', user.email);
        console.log('Stored hashed password:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Bcrypt compare result:', isMatch);

        if (!isMatch) {
            // Try to see if it was double hashed or something
            const salt = await bcrypt.genSalt(10);
            const manualHash = await bcrypt.hash(password, salt);
            console.log('Manual hash of password123:', manualHash);
        }

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testLogin();
