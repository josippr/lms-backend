const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = 'devices-metrics';

router.post('/usage-metrics', async (req, res) => {
  if (req.headers['x-ssl-client-verify'] !== 'SUCCESS') {
    return res.status(403).json({ error: 'Client certificate verification failed' });
  }

  const data = req.body;
  if (!data || !data.uid || !data.timestamp || !data.hardware) {
    return res.status(400).json({ error: 'Missing required fields (uid, timestamp, hardware)' });
  }

  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

    await col.insertOne({
      ...data,
      receivedAt: new Date()
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[ERROR] MongoDB insert failed:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
