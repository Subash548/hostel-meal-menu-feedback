const User = require('../models/User');
const Alert = require('../models/Alert');
const { sendEmail } = require('./notifications');
const { generateWithFallback } = require('./aiHelper');

/**
 * Runs the AI-powered allergy matching algorithm for a given menu and stores alerts.
 * @param {Object} menu - The saved Menu document
 */
const runAllergyCheck = async (menu) => {
    try {
        console.log(`Running AI allergy engine for menu date: ${menu.day}`);
        const students = await User.find({ role: 'student' });
        
        // Find existing alerts for this menu and delete them so we don't duplicate on edit
        await Alert.deleteMany({ menu: menu._id });

        const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
        
        // 1. Gather all unique allergies across all students
        const allUniqueAllergies = [...new Set(
            students.flatMap(s => [...(s.allergies || []), ...(s.customAllergies || [])].map(a => a.toLowerCase().trim()))
        )].filter(a => a);

        if (allUniqueAllergies.length === 0) {
            console.log("No student allergies found in the database. Safe.");
            return;
        }

        // 2. Gather all dishes in the menu
        const menuDishesList = [];
        for (const mt of mealTypes) {
            const dishes = menu[mt] || [];
            dishes.forEach(d => {
                // we include ingredients & existing tags as hints for the AI
                menuDishesList.push({
                    name: d.name,
                    ingredients: (d.ingredients || []).join(', '),
                    tags: (d.allergenTags || []).join(', ')
                });
            });
        }

        if (menuDishesList.length === 0) return;

        // 3. Ask AI to cross-reference allergies against dishes
        let aiAllergyMap = {};
        try {
            const prompt = `You are an expert food safety and allergy analyzer.
I will provide a list of specific allergies our students have, and a list of dishes served today.
Your job is to determine exactly which specific allergies from the list are triggered by which dish, using your culinary knowledge of the dish, its ingredients, and common food science.

Student Allergies to check for: ${JSON.stringify(allUniqueAllergies)}

Dishes on the Menu:
${JSON.stringify(menuDishesList)}

Return a strict JSON object where the keys are the EXACT dish names provided, and the values are arrays of the specific student allergies (from the provided list) that are present or highly likely to be traces in the dish.
Ensure exact spelling matching from the provided 'Student Allergies to check for' list.
Example format:
{"Butter Chicken": ["dairy", "spices"], "Roti": ["gluten"]}

Return ONLY valid JSON (no markdown block formatting).`;

            let rawText = await generateWithFallback(prompt);
            rawText = rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            aiAllergyMap = JSON.parse(rawText);
            console.log("[AI Allergy Engine] Mapping received:", aiAllergyMap);
        } catch (aiErr) {
            console.error("AI Allergy Engine failed, falling back to substring matching:", aiErr.message);
            // Fallback: If AI fails, create a basic map using simple substring/tag matching
            aiAllergyMap = {};
            for (const dish of menuDishesList) {
                const matched = [];
                const searchString = `${dish.name} ${dish.ingredients} ${dish.tags}`.toLowerCase();
                for (const alg of allUniqueAllergies) {
                    if (searchString.includes(alg)) {
                        matched.push(alg);
                    }
                }
                aiAllergyMap[dish.name] = matched;
            }
        }

        // 4. Generate alerts for individual students based on the AI map
        const alertsToInsert = [];

        for (const student of students) {
            const studentAllergies = [
                ...(student.allergies || []), 
                ...(student.customAllergies || [])
            ].map(a => a.toLowerCase().trim());

            if (studentAllergies.length === 0) continue;

            for (const mealType of mealTypes) {
                const dishes = menu[mealType] || [];
                
                for (const dish of dishes) {
                    // Extract what the AI matched for this specific dish
                    const aiMatchedForDish = aiAllergyMap[dish.name] || [];
                    
                    // Intersect AI matches with this specific student's allergies
                    const criticalMatches = studentAllergies.filter(alg => 
                        aiMatchedForDish.map(a => a.toLowerCase()).includes(alg)
                    );

                    if (criticalMatches.length > 0) {
                        const message = `CRITICAL (via AI Detector): Today's ${mealType} contains ${criticalMatches.join(', ').toUpperCase()} in ${dish.name}. Please inform mess staff.`;

                        alertsToInsert.push({
                            user: student._id,
                            menu: menu._id,
                            date: new Date(menu.day), // Date string to Date object
                            mealType,
                            dishName: dish.name,
                            matchedAllergens: criticalMatches,
                            severity: 'Critical',
                            message
                        });
                    }
                }
            }
        }

        // 5. Insert and Notify
        if (alertsToInsert.length > 0) {
            const insertedAlerts = await Alert.insertMany(alertsToInsert);
            console.log(`Generated ${alertsToInsert.length} AI-powered allergy alerts.`);
            
            // Dispatch notifications for critical alerts
            for (const alert of alertsToInsert) {
                const studentToNotify = students.find(s => s._id.equals(alert.user));
                if (studentToNotify && studentToNotify.email) {
                    const emailMessage = `HostelFresh Critical Allergy Alert:\n\n${alert.message}\n\nPlease take necessary precautions.`;
                    try {
                        await sendEmail(
                            studentToNotify.email, 
                            "CRITICAL Allergy Alert - HostelFresh", 
                            emailMessage, 
                            `<p><strong>HostelFresh Critical Allergy Alert:</strong></p><p>${alert.message}</p><p>Please take necessary precautions.</p>`
                        );
                    } catch (emailErr) {
                        // ignore email failures silently in logs so it doesn't crash the loop
                        console.error('Failed to notify student:', emailErr.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error in AI allergy engine:", err);
    }
};

module.exports = {
    runAllergyCheck
};
