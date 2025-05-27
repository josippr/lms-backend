const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const DB_COLLECTION = "nodes";

router.post("/api/register-device", verifyToken, async (req, res) => {
  const { serial, deviceName } = req.body;
  const { serial: tokenSerial } = req.device;

  if (tokenSerial !== serial) {
    return res.status(403).json({ error: "Token does not match device serial" });
  }

  let client;
  try {
    client = await MongoClient.connect(MONGO_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION);

    const existing = await collection.findOne({ serial });

    if (existing?.registered) {
      return res.status(200).json({ message: "Already registered" });
    }

    const update = {
      $set: {
        serial,
        deviceName,
        registered: true,
        registeredAt: new Date(),
        lastSeen: new Date(),
        license: "basic",
        owner: "pending",
      },
    };

    const options = { upsert: true, returnDocument: "after" };

    const result = await collection.findOneAndUpdate({ serial }, update, options);

    res.json({
      success: true,
      license: result.value.license,
      owner: result.value.owner,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

module.exports = router;
