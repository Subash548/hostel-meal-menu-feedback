const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  hostel_id: { type: String }, // Optional, left from previous SQLite version for backward compatibility
  roomNumber: { type: String },
  phone: { type: String },
  allergies: [{ type: String, enum: ['Nuts', 'Gluten', 'Dairy', 'Egg', 'Soy', 'Seafood', 'Spices', 'Sulfites'] }],
  customAllergies: [{ type: String }],
  notificationPrefs: {
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  pushToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
