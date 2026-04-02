const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'snacks', 'dinner'], required: true },
  dishName: { type: String, required: true },
  matchedAllergens: [{ type: String }],
  severity: { type: String, enum: ['Safe', 'Caution', 'Critical'], required: true },
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
