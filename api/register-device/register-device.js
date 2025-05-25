const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const Device = require("../../models/device");

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const DB_COLLECTION = "nodes";

router.post("/api/register-device", verifyToken, async (req, res) => {
  const { serial, deviceName } = req.body;
  const { serial: tokenSerial } = req.device;

  if (tokenSerial !== serial) {
    return res.status(403).json({ error: "Token does not match device serial" });
  }

  // Check if already registered
  const device = await Device.findOne({ serial });
  if (device && device.registered) {
    return res.status(200).json({ message: "Already registered" });
  }

  const updated = await Device.findOneAndUpdate(
    { serial },
    {
      $set: {
        deviceName,
        registered: true,
        registeredAt: new Date(),
        lastSeen: new Date(),
        license: "basic",
        owner: "pending",
      },
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    license: updated.license,
    owner: updated.owner,
  });
});

module.exports = router;