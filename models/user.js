const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Node" }],
});
module.exports = mongoose.model("User", userSchema);