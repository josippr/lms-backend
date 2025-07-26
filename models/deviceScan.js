const mongoose = require('mongoose');

const deviceScanSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  mac: { type: String, required: true, index: true },
  ip: { type: String },
  hostname: { type: String },
  type: { type: String },
  active: { type: Boolean, default: false },
  traffic: {
    packets: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 }
  },
  deviceId: { type: String },
  receivedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceScan', deviceScanSchema, 'device-scans');
