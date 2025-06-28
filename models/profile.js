const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: String,
  email: String,
  language: { type: String, default: 'en' },
  darkMode: { type: Boolean, default: false },
  linkedNodes: [String],
  roles: [String],
  tags: [String],
  notificationPreferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  routes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  license: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
