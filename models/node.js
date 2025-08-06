const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  Type: { type: String, required: true },
  S_N: { type: String, required: true },
  DeviceName: { type: String, required: true },
  mac: { type: String, required: true },
  hw_ver: { type: String, required: true },
  sw_ver: { type: String, required: true }, 
  lastSync: { type: Number, required: true },
  uid: { type: String, required: true },
  latlong: { type: String, required: true },
}, { collection: 'nodes' });

module.exports = mongoose.model('Node', nodeSchema);