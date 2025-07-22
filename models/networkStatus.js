const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  hostname: { type: String },
  deviceName: { type: String },
  brand: { type: String },
  model: { type: String },
  macAddress: { type: String },
  lastSeen: { type: Number }
}, { _id: false });

const NetworkStatusSchema = new mongoose.Schema({
  version: { type: String, default: '1.0' },
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true },

  payload: {
    networkStatus: {
      bandwidthKbps: { type: Number },
      maxBandwidthKbps: { type: Number },
      packetCount: { type: Number },
      deviceCount: { type: Number },
      activeDevices: [DeviceSchema],
      avgRttMs: { type: Number },
      packetLossPercent: { type: Number },
      outOfOrderCount: { type: Number },
      jitterMs: { type: Number },
      pingLatencyMs: { type: Number }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('NetworkMetrics', NetworkStatusSchema, 'network-status');