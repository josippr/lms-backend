const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = 'devices-metrics';

router.post('/usage-metrics', async (req, res) => {
  console.log('Received request headers:', req.headers);
  
  if (req.headers['x-ssl-client-verify'] !== 'SUCCESS') {
    console.log('Client certificate verification failed. Headers:', req.headers);
    return res.status(403).json({ 
      error: 'Client certificate verification failed',
      details: {
        receivedVerifyHeader: req.headers['x-ssl-client-verify'],
        requiredVerifyHeader: 'SUCCESS'
      }
    });
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

    const result = await col.insertOne({
      ...data,
      receivedAt: new Date()
    });

    await client.close();
    
    res.status(200).json({ 
      status: 'ok',
      insertedId: result.insertedId
    });
  } catch (err) {
    console.error('[ERROR] MongoDB insert failed:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;