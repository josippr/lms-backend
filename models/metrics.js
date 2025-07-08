const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  version: String,
  deviceId: { type: String, required: true },
  messageId: { type: String, default: () => crypto.randomUUID() },
  timestamp: { type: Date, required: true },
  payload: {
    metrics: {
      cpu: {
        usage: Number,
        temperature: Number
      },
      memory: {
        total: Number,
        used: Number
      },
      disk: {
        total: Number,
        used: Number
      },
      uptime: Number
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Metrics', metricsSchema);
