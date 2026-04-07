const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Menu = require('../models/Menu');
const { runAllergyCheck } = require('../services/allergyEngine');
const router = express.Router();

// Register Student
router.post('/register', async (req, res) => {
    try {
        const { 
            name, email, password, hostel_id, roomNumber, phone, 
            allergies, customAllergies, notificationPrefs 
        } = req.body;

        if (!name || !email || !password || !hostel_id) {
            return res.status(400).json({ error: "Name, email, password, and hostel_id are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hash = bcrypt.hashSync(password, 10);
        
        const newUser = await User.create({
            name,
            email,
            password: hash,
            role: 'student',
            hostel_id,
            roomNumber,
            phone,
            allergies: allergies || [],
            customAllergies: customAllergies || [],
            notificationPrefs: notificationPrefs || { push: false, email: false, sms: false }
        });

        // Run the allergy engine for all upcoming menus so this student gets alerts immediately
        if ((allergies && allergies.length > 0) || (customAllergies && customAllergies.length > 0)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcomingMenus = await Menu.find({ date: { $gte: today } });
            for (const menu of upcomingMenus) {
                await runAllergyCheck(menu);
            }
        }

        res.json({ message: "Student registered successfully" });
    } catch (err) {
        console.error("Error registering student:", err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const validPass = bcrypt.compareSync(password, user.password);
        if (!validPass) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret_key', 
            { expiresIn: '1h' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                allergies: user.allergies,
                customAllergies: user.customAllergies
            } 
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

module.exports = router;
