const cron = require('node-cron');
const Menu = require('../models/Menu');
const User = require('../models/User');
const { dispatchNotifications } = require('./notifications');

// Define meal times in 24hr format
const MEAL_SCHEDULE = {
    breakfast: { hour: 7, minute: 30 },
    lunch: { hour: 12, minute: 30 },
    snacks: { hour: 17, minute: 0 },
    dinner: { hour: 19, minute: 30 }
};

// Calculate run times for cron (30 mins before)
// Breakfast: 7:00
// Lunch: 12:00
// Snacks: 16:30
// Dinner: 19:00
const CRON_SCHEDULES = {
    breakfast: '0 7 * * *',
    lunch: '0 12 * * *',
    snacks: '30 16 * * *',
    dinner: '0 19 * * *'
};

const runMealReminderJob = async (mealType) => {
    console.log(`[CRON] Running reminder job for: ${mealType}`);
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // 1. Fetch today's menu
        const todayMenu = await Menu.findOne({ day: dateString });
        if (!todayMenu || !todayMenu[mealType] || todayMenu[mealType].length === 0) {
            console.log(`[CRON] No menu found for ${mealType} today. Skipping reminders.`);
            return;
        }

        const menuText = todayMenu[mealType].map(d => d.name).join(', ');

        // 2. Fetch all students who opted into reminders
        // In reality, you could query `{ role: 'student', $or: [ { "notificationPrefs.email": true }, ... ] }`
        const students = await User.find({ role: 'student' });
        
        let count = 0;
        // 3. Dispatch
        for (const student of students) {
            const prefs = student.notificationPrefs || {};
            // If they have any pref turned on
            if (prefs.email || prefs.sms || prefs.push) {
                await dispatchNotifications(student, mealType.charAt(0).toUpperCase() + mealType.slice(1), menuText);
                count++;
            }
        }
        console.log(`[CRON] Dispatched ${mealType} reminders to ${count} students.`);

    } catch (err) {
        console.error(`[CRON] Error during ${mealType} reminder job:`, err);
    }
};

const startCronJobs = () => {
    console.log("Starting Meal Reminder Cron Jobs...");
    
    cron.schedule(CRON_SCHEDULES.breakfast, () => runMealReminderJob('breakfast'));
    cron.schedule(CRON_SCHEDULES.lunch, () => runMealReminderJob('lunch'));
    cron.schedule(CRON_SCHEDULES.snacks, () => runMealReminderJob('snacks'));
    cron.schedule(CRON_SCHEDULES.dinner, () => runMealReminderJob('dinner'));
    
    console.log("Cron Jobs scheduled successfully.");
};

module.exports = {
    startCronJobs
};
