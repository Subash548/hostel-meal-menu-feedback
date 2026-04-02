const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./hostel.db');

const weeklyMenu = [
    {
        day: 'Monday',
        breakfast: 'Idli, Chicken Salna, Omelette',
        lunch: 'Chicken Biryani, Onion Raitha, Egg Boil',
        snacks: 'Tea, Chicken Puff',
        dinner: 'Chapati, Pepper Chicken, Rice'
    },
    {
        day: 'Tuesday',
        breakfast: 'Dosa, Fish Curry',
        lunch: 'Rice, Fish Fry, Fish Kulambu, Rasam',
        snacks: 'Coffee, Egg Bonda',
        dinner: 'Parotta, Egg Curry, Kalaki'
    },
    {
        day: 'Wednesday',
        breakfast: 'Pongal, Mutton Gravy (Style)',
        lunch: 'Mutton Biryani, Brinjal Curry, Egg',
        snacks: 'Tea, Chicken Cutlet',
        dinner: 'Idiyappam, Paya (Trotter) Soup'
    },
    {
        day: 'Thursday',
        breakfast: 'Poori, Chicken Keema',
        lunch: 'Rice, Crab Curry, Fry, Rasam',
        snacks: 'Coffee, Bread Omelette',
        dinner: 'Rice, Chettinad Chicken Gravy'
    },
    {
        day: 'Friday',
        breakfast: 'Uthappam, Egg Curry',
        lunch: 'Ghee Rice, Chicken 65, Dalcha',
        snacks: 'Tea, Spicy Chicken Wings',
        dinner: 'Fried Rice, Chilli Chicken, Sauce'
    },
    {
        day: 'Saturday',
        breakfast: 'Kichadi, Vadai, Chicken Gravy',
        lunch: 'Rice, Karuvadu (Dry Fish) Kuzhambu, Egg Burji',
        snacks: 'Coffee, Egg Sandwich',
        dinner: 'Chapati, Butter Chicken'
    },
    {
        day: 'Sunday',
        breakfast: 'Bread, Omelette, Chicken Sausage',
        lunch: 'Special Hyderabadi Chicken Biryani, Raitha, Sweet',
        snacks: 'Juice, Chicken Roll',
        dinner: 'Rice, Rasam, Pepper Chicken Dry'
    }
];

db.serialize(() => {
    console.log("Cleaning up duplicate menu items...");

    // First, remove duplicates keeping only the latest entered one? 
    // Or simpler: delete everything and re-insert properly
    db.run("DELETE FROM menu", (err) => {
        if (err) {
            console.error("Error clearing menu table:", err);
            return;
        }
        console.log("Menu table cleared.");

        const stmt = db.prepare("INSERT INTO menu (day, breakfast, lunch, snacks, dinner) VALUES (?, ?, ?, ?, ?)");

        weeklyMenu.forEach(item => {
            stmt.run(item.day, item.breakfast, item.lunch, item.snacks, item.dinner, (err) => {
                if (err) console.error(`Error adding ${item.day}:`, err.message);
                else console.log(`Added Non-Veg Menu for ${item.day}`);
            });
        });

        stmt.finalize(() => {
            console.log("Menu re-seeded successfully without duplicates.");
            db.close();
        });
    });
});
