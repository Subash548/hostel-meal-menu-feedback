const User = require('../models/User');
const Alert = require('../models/Alert');

/**
 * Runs the allergy matching algorithm for a given menu and stores alerts.
 * @param {Object} menu - The saved Menu document
 */
const runAllergyCheck = async (menu) => {
    try {
        console.log(`Running allergy engine for menu date: ${menu.day}`);
        const students = await User.find({ role: 'student' });
        
        // Find existing alerts for this menu and delete them so we don't duplicate on edit
        await Alert.deleteMany({ menu: menu._id });

        const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
        const alertsToInsert = [];

        for (const student of students) {
            const studentAllergies = [
                ...(student.allergies || []), 
                ...(student.customAllergies || [])
            ].map(a => a.toLowerCase().trim());

            if (studentAllergies.length === 0) continue; // No allergies, safe.

            for (const mealType of mealTypes) {
                const dishes = menu[mealType] || [];
                
                for (const dish of dishes) {
                    let severity = 'Safe';
                    let matchedAllergens = [];

                    // 1. Check direct tags (Critical)
                    const dishTags = (dish.allergenTags || []).map(t => t.toLowerCase().trim());
                    for (const allergy of studentAllergies) {
                        if (dishTags.includes(allergy)) {
                            severity = 'Critical';
                            matchedAllergens.push(allergy);
                        }
                    }

                    // 2. Check ingredients for substrings (Caution) if not already Critical
                    if (severity !== 'Critical') {
                        const ingredientsText = (dish.ingredients || []).join(' ').toLowerCase();
                        for (const allergy of studentAllergies) {
                            if (ingredientsText.includes(allergy)) {
                                severity = 'Caution';
                                matchedAllergens.push(allergy);
                            }
                        }
                    }

                    if (severity !== 'Safe') {
                        let message = '';
                        if (severity === 'Critical') {
                            message = `CRITICAL: Today's ${mealType} contains ${matchedAllergens.join(', ').toUpperCase()} in ${dish.name}. Please inform mess staff.`;
                        } else {
                            message = `CAUTION: ${dish.name} (served for ${mealType}) may contain traces of ${matchedAllergens.join(', ')} based on ingredients list.`;
                        }

                        alertsToInsert.push({
                            user: student._id,
                            menu: menu._id,
                            date: new Date(menu.day), // Date string to Date object
                            mealType,
                            dishName: dish.name,
                            matchedAllergens,
                            severity,
                            message
                        });
                    }
                }
            }
        }

        if (alertsToInsert.length > 0) {
            await Alert.insertMany(alertsToInsert);
            console.log(`Generated ${alertsToInsert.length} allergy alerts.`);
            
            // Note: In real production, this is where we'd trigger push notifications/emails 
            // for the newly inserted critical alerts.
        }
    } catch (err) {
        console.error("Error in allergy engine:", err);
    }
};

module.exports = {
    runAllergyCheck
};
