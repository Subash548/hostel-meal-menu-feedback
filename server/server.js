require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

app.get('/', (req, res) => {
    res.json({ message: "Hostel Meal Menu API is running" });
});

// Import and start cron jobs
const { startCronJobs } = require('./services/reminderCron');
startCronJobs();

// Start server locally if not in Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel Serverless
module.exports = app;
