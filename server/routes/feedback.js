const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Submit Feedback (Student Only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: "Only students can submit feedback" });

        const { meal_type, rating, comment } = req.body;
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        await Feedback.create({
            user: req.user.id,
            meal_type,
            rating,
            comment,
            date
        });

        res.json({ message: "Feedback submitted successfully" });
    } catch (err) {
        console.error("Error submitting feedback:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// View Feedback (Admin Only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

        const feedbacks = await Feedback.find()
            .populate('user', 'name') // Join to get user name
            .sort({ date: -1 });
            
        // Map to match the existing front-end expected structure which probably expects student_name
        const formattedFeedbacks = feedbacks.map(f => ({
            id: f._id,
            user_id: f.user._id,
            student_name: f.user.name,
            meal_type: f.meal_type,
            rating: f.rating,
            comment: f.comment,
            date: f.date
        }));

        res.json(formattedFeedbacks);
    } catch (err) {
        console.error("Error fetching feedback:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
