const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = 'devices-metrics';
const SYNC_COLLECTION_NAME= 'nodes';

router.post('/usage-metrics', async (req, res) => {
  
  if (req.headers['x-ssl-client-verify'] !== 'SUCCESS') {
    console.error('Client certificate verification failed. Headers:', req.headers);
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

    // Insert full usage data into devices-metrics
    const metricsCollection = db.collection(COLLECTION_NAME);
    const insertResult = await metricsCollection.insertOne({
      ...data,
      receivedAt: new Date()
    });

    // Update lastSync timestamp in nodes collection
    if (data.hardware.lastSync) {
      const nodesCollection = db.collection(SYNC_COLLECTION_NAME);
      await nodesCollection.updateOne(
        { uid: data.uid },
        { $set: { lastSync: data.hardware.lastSync } }
      );
    }

    await client.close();

    res.status(200).json({ 
      status: 'ok',
      insertedId: insertResult.insertedId
    });
  } catch (err) {
    console.error('[ERROR] MongoDB insert failed:', err);
    res.status(500).json({ error: 'Database error, db insert failed: ' , details: err.message });
  }
});

module.exports = router;