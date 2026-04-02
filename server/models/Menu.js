const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Poha"
  ingredients: [{ type: String }], // Optional list of ingredients
  allergenTags: [{ type: String }] // List of identified allergens in this dish (e.g., "Nuts", "Dairy")
});

const menuSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // The specific date for this menu
  day: { type: String, required: true }, // Monday, Tuesday, etc. (for display/easier querying)
  breakfast: [dishSchema],
  lunch: [dishSchema],
  snacks: [dishSchema],
  dinner: [dishSchema]
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
