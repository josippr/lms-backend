const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const Metrics = require('../../models/metrics');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = 'devices-metrics';
const SYNC_COLLECTION_NAME = 'nodes';

router.post('/', async (req, res) => {
  console.log('[api/json] Received request headers:', req.headers);

  // 1. SSL client cert check
  if (req.headers['x-ssl-client-verify'] !== 'SUCCESS') {
    return res.status(403).json({
      error: 'Client certificate verification failed',
      details: {
        receivedVerifyHeader: req.headers['x-ssl-client-verify'],
        requiredVerifyHeader: 'SUCCESS'
      }
    });
  }

  const data = req.body;

  // 2. Determine format
  const isLegacy = data?.uid && data?.hardware && data?.timestamp;

  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);

    if (isLegacy) {
      console.log('[api/json] Handling legacy hardware metrics from UID:', data.uid);

      // Insert raw usage data
      const result = await db.collection(COLLECTION_NAME).insertOne({
        ...data,
        receivedAt: new Date()
      });

      // Update lastSync in 'nodes' collection
      if (data.hardware.lastSync) {
        await db.collection(SYNC_COLLECTION_NAME).updateOne(
          { uid: data.uid },
          { $set: { lastSync: data.hardware.lastSync } }
        );
      }

      await client.close();
      return res.status(200).json({ status: 'ok', insertedId: result.insertedId });
    }

    // 3. New structure
    const { deviceId, timestamp, payload } = data;

    if (!deviceId || !timestamp || !payload) {
      await client.close();
      return res.status(400).json({ error: 'Missing required fields (deviceId, timestamp, payload)' });
    }

    const saveTasks = [];

    if (payload.metrics) {
      saveTasks.push(Metrics.create({
        version: data.version || '1.0',
        deviceId,
        timestamp,
        payload: { metrics: payload.metrics }
      }));
    }

    await Promise.all(saveTasks);
    await client.close();

    return res.status(201).json({ message: 'Data received and stored' });

  } catch (err) {
    console.error('[api/json] Error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

module.exports = router;
