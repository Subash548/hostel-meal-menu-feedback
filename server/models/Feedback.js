const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meal_type: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  date: { type: String, required: true } // YYYY-MM-DD
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
