const mongoose = require('mongoose');

const SpeedtestSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  payload: {
    speedtest: {
      hostname: { type: String, required: true },
      ping_ms: { type: Number, required: true },
      download_mbps: { type: Number, required: true },
      upload_mbps: { type: Number, required: true },
      server: { type: String, required: true },
    }
  }
});

module.exports = mongoose.model('Speedtest', SpeedtestSchema, 'network-speedtest');
