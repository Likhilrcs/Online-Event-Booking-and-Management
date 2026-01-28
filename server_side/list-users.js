const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function listUsers() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Role: ${u.role}, HasPassword: ${!!u.password}`);
        });

    } catch (err) {
        console.error('List users failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
