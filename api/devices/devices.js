const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const verifyToken = require('../../middleware/verifyToken');
const router = express.Router();

// MongoDB Device Schema
const deviceSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  idOfTheItem: { type: String, required: true }, // Fixed typo in field name
  ip: { 
    type: String,
    required: true,
    match: [/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Please enter a valid IP address']
  },
  mac: {
    type: String,
    required: true,
    match: [/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Please enter a valid MAC address']
  },
  hostname: {
    type: String,
    required: true,
    match: [/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/, 'Please enter a valid hostname']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'info' }); // Explicitly setting collection name to 'info'

const Device = mongoose.model('Device', deviceSchema);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI_ORIGINAL;
mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  dbName: 'lms-stage'
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

router.get("/", async (_, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;