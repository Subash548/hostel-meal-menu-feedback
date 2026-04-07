const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.log("No MONGODB_URI found, starting local in-memory database...");
            const mongoServer = await MongoMemoryServer.create();
            mongoURI = mongoServer.getUri();
        }

        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB at " + mongoURI);

        // Seed Admin User
        const adminEmail = "admin@hostel.com";
        const adminPass = "admin123";
        
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(adminPass, salt);
            
            await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hash,
                role: 'admin'
            });
            console.log("Admin user seeded.");
        }

        // Seed default menus if empty (useful for local memory DB)
        const Menu = require('./models/Menu');
        const { runAllergyCheck } = require('./services/allergyEngine');
        const menuCount = await Menu.countDocuments();
        if (menuCount === 0) {
            console.log("Seeding initial menu data...");
            
            const weeklyData = [
                { // 0: Sunday
                    breakfast: [{name: 'Bread'}, {name: 'Omelette'}, {name: 'Chicken Sausage'}],
                    lunch: [{name: 'Special Hyderabadi Chicken Biryani', allergenTags: ['Spices']}, {name: 'Raitha'}, {name: 'Sweet', allergenTags: ['Dairy']}],
                    snacks: [{name: 'Juice'}, {name: 'Chicken Roll', allergenTags: ['Wheat']}],
                    dinner: [{name: 'Rice'}, {name: 'Rasam'}, {name: 'Pepper Chicken Dry'}]
                },
                { // 1: Monday
                    breakfast: [{name: 'Idli'}, {name: 'Chicken Salna'}, {name: 'Omelette', allergenTags: ['Egg']}],
                    lunch: [{name: 'Chicken Biryani'}, {name: 'Onion Raitha', allergenTags: ['Dairy']}, {name: 'Egg Boil', allergenTags: ['Egg']}],
                    snacks: [{name: 'Tea'}, {name: 'Chicken Puff'}],
                    dinner: [{name: 'Chapati'}, {name: 'Pepper Chicken'}, {name: 'Rice'}]
                },
                { // 2: Tuesday
                    breakfast: [{name: 'Dosa'}, {name: 'Fish Curry', allergenTags: ['Seafood']}],
                    lunch: [{name: 'Rice'}, {name: 'Fish Fry', allergenTags: ['Seafood']}, {name: 'Fish Kulambu'}, {name: 'Rasam'}],
                    snacks: [{name: 'Coffee'}, {name: 'Egg Bonda', allergenTags: ['Egg']}],
                    dinner: [{name: 'Parotta', allergenTags: ['Gluten']}, {name: 'Egg Curry'}, {name: 'Kalaki'}]
                },
                { // 3: Wednesday
                    breakfast: [{name: 'Pongal'}, {name: 'Mutton Gravy'}],
                    lunch: [{name: 'Mutton Biryani'}, {name: 'Brinjal Curry'}, {name: 'Egg', allergenTags: ['Egg']}],
                    snacks: [{name: 'Tea', allergenTags: ['Dairy']}, {name: 'Chicken Cutlet'}],
                    dinner: [{name: 'Idiyappam'}, {name: 'Paya Soup'}]
                },
                { // 4: Thursday
                    breakfast: [{name: 'Poori', allergenTags: ['Gluten']}, {name: 'Chicken Keema'}],
                    lunch: [{name: 'Rice'}, {name: 'Crab Curry', allergenTags: ['Seafood']}, {name: 'Fry'}, {name: 'Rasam'}],
                    snacks: [{name: 'Coffee'}, {name: 'Bread Omelette', allergenTags: ['Egg', 'Gluten']}],
                    dinner: [{name: 'Rice'}, {name: 'Chettinad Chicken Gravy', allergenTags: ['Spices']}]
                },
                { // 5: Friday
                    breakfast: [{name: 'Uthappam'}, {name: 'Egg Curry', allergenTags: ['Egg']}],
                    lunch: [{name: 'Ghee Rice', allergenTags: ['Dairy']}, {name: 'Chicken 65'}, {name: 'Dalcha'}],
                    snacks: [{name: 'Tea'}, {name: 'Spicy Chicken Wings'}],
                    dinner: [{name: 'Fried Rice'}, {name: 'Chilli Chicken'}, {name: 'Sauce'}]
                },
                { // 6: Saturday
                    breakfast: [{name: 'Kichadi'}, {name: 'Vadai'}, {name: 'Chicken Gravy'}],
                    lunch: [{name: 'Rice'}, {name: 'Dry Fish Kuzhambu', allergenTags: ['Seafood']}, {name: 'Egg Burji', allergenTags: ['Egg']}],
                    snacks: [{name: 'Coffee'}, {name: 'Egg Sandwich', allergenTags: ['Egg']}],
                    dinner: [{name: 'Chapati'}, {name: 'Butter Chicken', allergenTags: ['Dairy']}]
                }
            ];

            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const dayStr = String(d.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${dayStr}`;

                const dayOfWeek = d.getDay();
                const dailyMenu = weeklyData[dayOfWeek];

                const createdMenu = await Menu.create({
                    date: d,
                    day: dateString,
                    breakfast: dailyMenu.breakfast,
                    lunch: dailyMenu.lunch,
                    snacks: dailyMenu.snacks,
                    dinner: dailyMenu.dinner
                });
                // Run allergy engine for each seeded menu so alerts are generated on startup
                await runAllergyCheck(createdMenu);
            }
            console.log("Menu data seeded perfectly with dynamic day-to-day variations.");
        }

    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};

connectDB();

module.exports = mongoose.connection;
