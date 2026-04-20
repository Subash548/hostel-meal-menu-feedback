require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.get(['/api/health', '/health'], (req, res) => {
    res.json({ message: "Hostel Meal Menu API is running", env: process.env.VERCEL ? 'vercel' : 'local' });
});

// Ensure DB is connected before any routes handle the request
app.use(async (req, res, next) => {
    try {
        if (db && typeof db.connectDB === 'function') {
            await db.connectDB();
        }
        next();
    } catch (err) {
        console.error("DB Connection Error in Middleware:", err);
        res.status(500).json({ error: "Failed to connect to database", details: err.message, stack: process.env.VERCEL ? undefined : err.stack });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Import and start cron jobs
const { startCronJobs } = require('./services/reminderCron');
startCronJobs();

// Start server locally if not in Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} at 0.0.0.0`);
        console.log(`Test URL: http://localhost:${PORT}/health`);
    });
}

// Export for Vercel Serverless
module.exports = app;
