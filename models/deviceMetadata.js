const mongoose = require('mongoose');

const deviceMetadataSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  mac: { type: String, required: true, unique: true },
  hostname: { type: String, default: 'unknown' },
  lastIP: { type: String },
  trusted: { type: String, enum: ['trusted', 'neutral', 'untrusted'], default: 'neutral' },
  notes: { type: String, default: '' },
  tags: { type: [String], default: [] },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceMetadata', deviceMetadataSchema, 'device-metadata');
