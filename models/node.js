const mongoose = require('mongoose');
const nodeSchema = new mongoose.Schema({
  uid: String,
  Type: String,
  DeviceName: String,
  lastSync: String,  // or Number if you want to convert
  // other fields that exist in your actual documents
}, { collection: 'nodes' });
module.exports = mongoose.model('Node', nodeSchema);