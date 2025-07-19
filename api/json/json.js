const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const Metrics = require('../../models/metrics');
const NetworkStatus = require('../../models/networkStatus');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = 'devices-metrics';
const SYNC_COLLECTION_NAME = 'nodes';

router.post('/', async (req, res) => {
  console.log('[api/json] Received request headers:', req.headers);

  // SSL client cert check
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
  const io = req.io;

  const isLegacy = data?.uid && data?.hardware && data?.timestamp;

  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);

    if (isLegacy) {
      console.log('[api/json] Handling legacy hardware metrics from UID:', data.uid);

      const result = await db.collection(COLLECTION_NAME).insertOne({
        ...data,
        receivedAt: new Date()
      });

      if (data.hardware.lastSync) {
        await db.collection(SYNC_COLLECTION_NAME).updateOne(
          { uid: data.uid },
          { $set: { lastSync: data.hardware.lastSync } }
        );
      }

      // Emit live update
      if (io) {
        io.emit('new_metric', {
          uid: data.uid,
          timestamp: data.timestamp,
          hostname: data.hardware?.hostname,
          temperature: data.hardware?.cpu_temperature_c,
          uptime: data.hardware?.uptime_sec,
          memory: data.hardware?.memory_total_mb,
          memoryUsed: data.hardware?.memory_used_percent,
          memoryAvailable: data.hardware?.memory_available_percent,
          cpuPercent: data.hardware?.cpu_percent,
          disk: data.hardware?.disk_total_mb,
          receivedAt: new Date()
        });
      }

      await client.close();
      return res.status(200).json({ status: 'ok', insertedId: result.insertedId });
    }

    // New structure
    const { deviceId, timestamp, payload } = data;

    if (!deviceId || !timestamp || !payload) {
      await client.close();
      return res.status(400).json({ error: 'Missing required fields (deviceId, timestamp, payload)' });
    }

    const saveTasks = [];
    const now = new Date();

    if (payload.metrics) {
      const metricDoc = {
        version: data.version || '1.0',
        deviceId,
        timestamp,
        payload: { metrics: payload.metrics }
      };

      saveTasks.push(Metrics.create(metricDoc));

      // Emit real-time metric to frontend
      if (io) {
        io.emit('new_metric', {
          type: 'modern',
          deviceId,
          timestamp,
          payload: payload.metrics,
          receivedAt: now
        });
      }
    }

    // Handle network status metrics
    if (payload.networkStatus) {
      const networkDoc = {
        version: data.version || '1.0',
        deviceId,
        timestamp,
        payload: { networkStatus: payload.networkStatus }
      };

      console.log("debug payload: ", payload.networkStatus);

      saveTasks.push(NetworkStatus.create(networkDoc));

      if (io) {
        io.emit('new_metric', {
          type: 'network',
          deviceId,
          timestamp,
          payload: payload.networkStatus,
          receivedAt: now
        });
      }
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
