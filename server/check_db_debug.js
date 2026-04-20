const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkDB() {
    try {
        // connectDB from database.js logic
        let mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create({
                instance: {
                    dbPath: './memory_db' // try to use a persistent path if possible to check what's happening
                }
            });
            mongoURI = mongoServer.getUri();
        }
        await mongoose.connect(mongoURI);
        console.log("Connected to DB");
        
        const count = await User.countDocuments();
        console.log("Total users:", count);
        
        const admin = await User.findOne({ email: 'admin@hostel.com' });
        if (admin) {
            console.log("Admin user found:", admin.email, "Role:", admin.role);
        } else {
            console.log("Admin user NOT found");
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Check failed:", err);
        process.exit(1);
    }
}

checkDB();
