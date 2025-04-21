const moongose = require('mongoose');
const tokenSchema = new moongose.Schema({
  nodeId: String,
  token: String,
  used: Boolean,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});
module.exports = moongose.model('RegistrationToken', tokenSchema);