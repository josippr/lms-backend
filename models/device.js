const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
  serial: { type: String, required: true, unique: true },
  deviceName: String,
  registered: { type: Boolean, default: false },
  registeredAt: Date,
  lastSeen: Date,
  license: String,
  owner: String,
  token: String,
}, { collation: "nodes" });

module.exports = mongoose.model("Device", DeviceSchema);
