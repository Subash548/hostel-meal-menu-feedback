const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Alert = require('../models/Alert');
const auth = require('../middleware/authMiddleware');

router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

        const students = await User.find({ role: 'student' });
        const totalStudents = students.length;

        // Calculate students with allergies
        let totalWithAllergies = 0;
        const allergyCounts = {};

        students.forEach(student => {
            const allAllergies = [...(student.allergies || []), ...(student.customAllergies || [])];
            if (allAllergies.length > 0) totalWithAllergies++;
            
            allAllergies.forEach(a => {
                const norm = a.toLowerCase().trim();
                allergyCounts[norm] = (allergyCounts[norm] || 0) + 1;
            });
        });

        // Convert counts to array for recharts
        const allergyBreakdown = Object.keys(allergyCounts).map(name => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            students: allergyCounts[name]
        })).sort((a,b) => b.students - a.students);

        // Alerts sent today
        const today = new Date();
        today.setHours(0,0,0,0);
        const alertsToday = await Alert.find({ date: { $gte: today } }).populate('user', 'name');

        const totalAlertsToday = alertsToday.length;

        // Per-meal risk summary
        const riskSummary = {
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: []
        };

        alertsToday.forEach(alert => {
            if (alert.severity === 'Critical') {
                riskSummary[alert.mealType].push({
                    studentName: alert.user.name,
                    dish: alert.dishName,
                    allergens: alert.matchedAllergens
                });
            }
        });

        res.json({
            totalStudents,
            totalWithAllergies,
            totalAlertsToday,
            allergyBreakdown,
            riskSummary
        });
    } catch (err) {
        console.error("Error fetching admin stats:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
