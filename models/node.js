const moongose = require('mongoose');
const nodeSchema = new mongoose.Schema({
  nodeId: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registered: Boolean,
  lastSeen: Date,
  activationTimestamp: Number,
});
module.exports = mongoose.model('Node', nodeSchema);