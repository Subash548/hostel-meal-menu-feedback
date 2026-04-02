const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/authMiddleware');

// Get Today's Menu
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const menu = await Menu.findOne({ day: dateString });
        if (!menu) {
            return res.json({ message: "No menu for today" });
        }
        res.json(menu);
    } catch (err) {
        console.error("Error fetching today's menu:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get Upcoming/All Menus (And auto-delete past menus)
router.get('/week', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // Auto-delete older menus first
        // Date strings are comparable lexicographically e.g. "2024-03-01" < "2024-03-02"
        await Menu.deleteMany({ day: { $lt: dateString } });

        // Then select current and upcoming
        const menus = await Menu.find({ day: { $gte: dateString } }).sort({ day: 1 });
        res.json(menus);
    } catch (err) {
        console.error("Error fetching week menu:", err);
        res.status(500).json({ error: "Server error" });
    }
});

const { runAllergyCheck } = require('../services/allergyEngine');

// Create/Update Menu (Admin Only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

        const { id, day, date, breakfast, lunch, snacks, dinner } = req.body;
        
        // ensure date is parsed if not provided but day (string) is
        const parsedDate = date || new Date(day); 

        if (id) {
            const updated = await Menu.findByIdAndUpdate(id, {
                day, date: parsedDate, breakfast, lunch, snacks, dinner
            }, { new: true });
            runAllergyCheck(updated);
            return res.json({ message: "Menu updated successfully" });
        } else {
            const existingMenu = await Menu.findOne({ day });
            if (existingMenu) {
                const updated = await Menu.findByIdAndUpdate(existingMenu._id, {
                    breakfast, lunch, snacks, dinner
                }, { new: true });
                runAllergyCheck(updated);
                return res.json({ message: "Menu updated successfully" });
            } else {
                const created = await Menu.create({
                    day, date: parsedDate, breakfast, lunch, snacks, dinner
                });
                runAllergyCheck(created);
                return res.json({ message: "Menu created successfully" });
            }
        }
    } catch (err) {
        console.error("Error saving menu:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: "Menu deleted successfully" });
    } catch (err) {
        console.error("Error deleting menu:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
