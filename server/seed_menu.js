const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./hostel.db');

const weeklyMenuTemplate = [
    {
        breakfast: 'Bread, Omelette, Chicken Sausage',
        lunch: 'Special Hyderabadi Chicken Biryani, Raitha, Sweet',
        snacks: 'Juice, Chicken Roll',
        dinner: 'Rice, Rasam, Pepper Chicken Dry'
    }, // Sunday (0)
    {
        breakfast: 'Idli, Chicken Salna, Omelette',
        lunch: 'Chicken Biryani, Onion Raitha, Egg Boil',
        snacks: 'Tea, Chicken Puff',
        dinner: 'Chapati, Pepper Chicken, Rice'
    }, // Monday (1)
    {
        breakfast: 'Dosa, Fish Curry',
        lunch: 'Rice, Fish Fry, Fish Kulambu, Rasam',
        snacks: 'Coffee, Egg Bonda',
        dinner: 'Parotta, Egg Curry, Kalaki'
    }, // Tuesday (2)
    {
        breakfast: 'Pongal, Mutton Gravy (Style)',
        lunch: 'Mutton Biryani, Brinjal Curry, Egg',
        snacks: 'Tea, Chicken Cutlet',
        dinner: 'Idiyappam, Paya (Trotter) Soup'
    }, // Wednesday (3)
    {
        breakfast: 'Poori, Chicken Keema',
        lunch: 'Rice, Crab Curry, Fry, Rasam',
        snacks: 'Coffee, Bread Omelette',
        dinner: 'Rice, Chettinad Chicken Gravy'
    }, // Thursday (4)
    {
        breakfast: 'Uthappam, Egg Curry',
        lunch: 'Ghee Rice, Chicken 65, Dalcha',
        snacks: 'Tea, Spicy Chicken Wings',
        dinner: 'Fried Rice, Chilli Chicken, Sauce'
    }, // Friday (5)
    {
        breakfast: 'Kichadi, Vadai, Chicken Gravy',
        lunch: 'Rice, Karuvadu (Dry Fish) Kuzhambu, Egg Burji',
        snacks: 'Coffee, Egg Sandwich',
        dinner: 'Chapati, Butter Chicken'
    } // Saturday (6)
];

const generateMonthlyMenu = () => {
    const menus = [];
    const today = new Date();

    // Generate 30 days of menus
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        // Format as YYYY-MM-DD (adjusting for local timezone appropriately)
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        const dailyMenu = weeklyMenuTemplate[dayOfWeek];

        menus.push({
            day: dateString,
            ...dailyMenu
        });
    }
    return menus;
};

db.serialize(() => {
    const monthlyMenu = generateMonthlyMenu();

    // Clear old menu to prepare for new monthly format
    db.run("DELETE FROM menu", (err) => {
        if (err) console.error("Error clearing menu:", err);
        else console.log("Cleared old menu.");
    });

    const stmt = db.prepare("INSERT INTO menu (day, breakfast, lunch, snacks, dinner) VALUES (?, ?, ?, ?, ?)");

    // Synchronously insert all 30 days without inner callbacks that skip DB queue
    monthlyMenu.forEach(item => {
        stmt.run(item.day, item.breakfast, item.lunch, item.snacks, item.dinner);
    });

    stmt.finalize();

    console.log("Monthly Menu queries enqueued.");
});

// Since the DB is serialized, close will occur after all inserts finish
db.close((err) => {
    if (err) {
        console.error("Error closing database:", err.message);
    } else {
        console.log("Database seeded correctly with 30 items and connection closed.");
    }
});
