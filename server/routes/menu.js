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

// AI Auto-Detect Ingredients & Allergens for a Dish (Admin Only)
router.post('/ai-detect-dish', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

        const { dishName } = req.body;
        if (!dishName || dishName.trim().length < 2) {
            return res.status(400).json({ error: "Please provide a valid dish name." });
        }

        const { generateWithFallback } = require('../services/aiHelper');

        const prompt = `You are an expert Indian food nutritionist. For the dish "${dishName.trim()}", provide:
1. A list of the main common ingredients (4-8 ingredients)
2. Any allergens from this list that apply: Nuts, Gluten, Dairy, Egg, Soy, Seafood, Spices, Sulfites

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{"ingredients": ["ingredient1", "ingredient2"], "allergenTags": ["Dairy", "Gluten"]}

If you don't recognize the dish, return: {"ingredients": [], "allergenTags": [], "unknown": true}`;

        let rawText = await generateWithFallback(prompt);
        rawText = rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

        let result;
        try {
            result = JSON.parse(rawText);
        } catch (parseErr) {
            return res.status(500).json({ error: "AI returned malformed data." });
        }

        res.json(result);
    } catch (err) {
        console.error("Error detecting dish:", err);
        res.status(500).json({ error: "AI detection failed: " + err.message });
    }
});

// AI Weekly Menu Generator (Admin Only)
router.post('/ai-generate', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

        // Fetch last 14 days of menus to understand what was recently served
        const recentMenus = await Menu.find({}).sort({ date: -1 }).limit(14);

        // Format past menus for context
        const pastMenuText = recentMenus.length > 0
            ? recentMenus.map(m => {
                const summarize = (dishes) => dishes?.map(d => d.name).join(', ') || 'None';
                return `Date: ${m.day} | Breakfast: ${summarize(m.breakfast)} | Lunch: ${summarize(m.lunch)} | Snacks: ${summarize(m.snacks)} | Dinner: ${summarize(m.dinner)}`;
              }).join('\n')
            : 'No recent menu history available.';

        // Calculate the next 7 days
        const next7Days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            next7Days.push({
                dateString: `${year}-${month}-${day}`,
                dayName: d.toLocaleDateString('en-US', { weekday: 'long' })
            });
        }

        const { generateWithFallback } = require('../services/aiHelper');

        const prompt = `You are an expert hostel mess nutritionist and menu planner for a student hostel in India.

Your task is to generate a 7-day meal plan for the following dates: ${next7Days.map(d => d.dateString).join(', ')}.

RECENT MENU HISTORY (avoid repeating these dishes too soon):
${pastMenuText}

REQUIREMENTS:
- Each day must have: breakfast, lunch, snacks, dinner
- Each meal must have 2-4 dishes
- Balance nutrition: include protein, carbs, vegetables daily
- Include popular Indian hostel meals (e.g., Idli, Poha, Dal Rice, Roti Sabzi, Pulao, etc.)
- Avoid repeating the same dish within the 7-day plan
- Snacks should be light (e.g., Tea & Biscuits, Samosa, Peanuts)
- For EACH dish, list 2-4 common ingredients

Return ONLY a valid JSON array (no markdown, no explanation), in this EXACT format:
[
  {
    "day": "YYYY-MM-DD",
    "breakfast": [{"name": "Dish Name", "ingredients": ["ing1", "ing2"], "allergenTags": []}],
    "lunch": [{"name": "Dish Name", "ingredients": ["ing1", "ing2"], "allergenTags": []}],
    "snacks": [{"name": "Dish Name", "ingredients": ["ing1", "ing2"], "allergenTags": []}],
    "dinner": [{"name": "Dish Name", "ingredients": ["ing1", "ing2"], "allergenTags": []}]
  }
]

The dates must match exactly: ${next7Days.map(d => `"${d.dateString}"`).join(', ')}
Return nothing except the JSON array.`;

        let rawText = await generateWithFallback(prompt);
        // Clean and parse the JSON
        rawText = rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

        let generatedMenus;
        try {
            generatedMenus = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("AI returned invalid JSON:", rawText);
            return res.status(500).json({ error: "AI returned malformed data. Please try again." });
        }

        res.json({ menus: generatedMenus });
    } catch (err) {
        console.error("Error generating AI menu:", err);
        res.status(500).json({ error: "AI generation failed: " + err.message });
    }
});

module.exports = router;
