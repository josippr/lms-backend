const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  uid: String,
  alert: {
    type: {
      type: String,
    },
    method: String,
    source: String,
    ports: [Number],
    protocols: [Number],
    timestamp: Number,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.IntrusionAlert || mongoose.model('IntrusionAlert', alertSchema, 'intrusion-alerts');