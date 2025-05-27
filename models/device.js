const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  serial: String,
  deviceName: String,
  registered: Boolean,
  registeredAt: Date,
  lastSeen: Date,
  license: String,
  owner: String,
});

module.exports = mongoose.models.Device || mongoose.model('Device', deviceSchema);