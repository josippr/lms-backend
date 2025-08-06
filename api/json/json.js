const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const Metrics = require('../../models/metrics');
const NetworkStatus = require('../../models/networkStatus');
const DeviceScan = require('../../models/deviceScan');
const DeviceMetadata = require('../../models/deviceMetadata');
const Speedtest = require('../../models/speedtest');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = 'devices-metrics';
const SYNC_COLLECTION_NAME = 'nodes';

router.post('/', async (req, res) => {

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

    console.log("debug payload: ", payload);

    if (payload.metrics) {
      const metricDoc = {
        version: data.version || '1.0',
        deviceId,
        timestamp,
        payload: { metrics: payload.metrics }
      };

      saveTasks.push(Metrics.create(metricDoc));

      // Emit real-time metric to frontend
      // if (io) {
      //   io.emit('new_metric', {
      //     type: 'modern',
      //     deviceId,
      //     timestamp,
      //     payload: payload.metrics,
      //     receivedAt: now
      //   });
      // }
    }

    // Handle network status metrics
    if (payload.networkStatus) {
      const rawStatus = payload.networkStatus;

      const normalizedDevices = (rawStatus.activeDevices || []).map(dev => {
        if (typeof dev === 'string') {
          return {
            ip: dev,
            hostname: null,
            model: null,
            macAddress: null,
            lastSeen: Math.floor(Date.now() / 1000)
          };
        } else {
          return {
            ip: dev.ip || null,
            hostname: dev.hostname || null,
            model: dev.model || null,
            macAddress: dev.macAddress || null,
            lastSeen: dev.lastSeen || Math.floor(Date.now() / 1000)
          };
        }
      });

      const normalizedNetworkStatus = {
        ...rawStatus,
        activeDevices: normalizedDevices
      };

      const networkDoc = {
        version: data.version || '1.0',
        deviceId,
        timestamp,
        payload: { networkStatus: normalizedNetworkStatus }
      };

      saveTasks.push(NetworkStatus.create(networkDoc));

      if (io) {
        console.log("debug normalized network status: ", normalizedNetworkStatus);
        io.emit('new_network_status', {
          type: 'network',
          deviceId,
          timestamp,
          payload: {
            networkStatus: normalizedNetworkStatus
          },
          receivedAt: now
        });
      }
    }

    // save to network-speedtest collection
    if (payload.speedtest) {

      const speedtestDoc = {
        version: data.version || '1.0',
        deviceId,
        timestamp,
        payload: { speedtest: payload.speedtest }
      };

      saveTasks.push(Speedtest.create(speedtestDoc));

      // if (io) {
      //   io.emit('new_speedtest', {
      //     type: 'speedtest',
      //     deviceId,
      //     timestamp,
      //     payload: payload.speedtest,
      //     receivedAt: now
      //   });
      // }

    }


    // Handle device scan data
    if (payload.deviceScans && Array.isArray(payload.deviceScans)) {
      const deviceScanDocs = payload.deviceScans.map(entry => ({
        ...entry,
        deviceId,
        receivedAt: now
      }));
      saveTasks.push(DeviceScan.insertMany(deviceScanDocs, { ordered: false }));
    }

    // Handle device metadata
    if (payload.deviceMetadata && Array.isArray(payload.deviceMetadata)) {
      const metadataOps = payload.deviceMetadata.map(entry => ({
        updateOne: {
          filter: { mac: entry.mac },
          update: {
            $setOnInsert: {
              firstSeen: entry.firstSeen,
              trusted: entry.trusted ?? 'neutral',
              notes: entry.notes ?? '',
              tags: entry.tags ?? []
            },
            $set: {
              uid: entry.uid,
              hostname: entry.hostname,
              lastIP: entry.lastIP,
              lastSeen: entry.lastSeen
            }
          },
          upsert: true
        }
      }));

      saveTasks.push(DeviceMetadata.bulkWrite(metadataOps, { ordered: false }));
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
