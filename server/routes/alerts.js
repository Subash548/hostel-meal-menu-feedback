const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/authMiddleware');

// Get Alerts for the logged-in student
router.get('/my-alerts', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: "Access denied" });

        // Get alerts for today or future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alerts = await Alert.find({ 
            user: req.user.id,
            date: { $gte: today }
        }).sort({ date: 1, createdAt: -1 });
        
        res.json(alerts);
    } catch (err) {
        console.error("Error fetching alerts:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin stats: get overview of alerts (for dashboard)
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count for today
        const totalAlertsToday = await Alert.countDocuments({ date: { $gte: today, $lt: new Date(today.getTime() + 24*60*60*1000) } });
        const criticalAlertsToday = await Alert.countDocuments({ 
            date: { $gte: today, $lt: new Date(today.getTime() + 24*60*60*1000) },
            severity: 'Critical'
        });

        res.json({
            totalAlertsToday,
            criticalAlertsToday
        });
    } catch (err) {
        console.error("Error fetching alert stats:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
