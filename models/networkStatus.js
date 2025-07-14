const mongoose = require('mongoose');

const NetworkStatusSchema = new mongoose.Schema({
  version: { type: String, default: '1.0' },
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true },

  payload: {
    networkStatus: {
      bandwidthKbps: { type: Number },
      packetCount: { type: Number },
      deviceCount: { type: Number },
      activeDevices: [{ type: String }],
      avgRttMs: { type: Number },
      packetLossPercent: { type: Number },
      outOfOrderCount: { type: Number },
      jitterMs: { type: Number }
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('NetworkMetrics', NetworkStatusSchema, 'network-status');
