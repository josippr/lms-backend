const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const collectionName = 'devices';

router.post('/report', async (req, res) => {
  if (req.headers['x-ssl-client-verify'] !== 'SUCCESS') {
    return res.status(403).json({ error: 'Client certificate verification failed' });
  }

  const deviceData = req.body;
  if (!deviceData || !deviceData.uid) {
    return res.status(400).json({ error: 'UID is required' });
  }

  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(collectionName);
    await col.insertOne({
      ...deviceData,
      receivedAt: new Date()
    });
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

module.exports = router;
