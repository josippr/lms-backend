const express = require('express');
const router = express.Router();
const DeviceMetadata = require('../../models/deviceMetadata');
const DeviceScan = require('../../models/deviceScan');
const verifyToken = require('../../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  try {
    // Fetch latest scan per MAC address using aggregation
    const latestScans = await DeviceScan.aggregate([
      {
        $sort: { receivedAt: -1 }
      },
      {
        $group: {
          _id: '$mac',
          scan: { $first: '$$ROOT' }
        }
      }
    ]);

    // Index scans by MAC for quick lookup
    const scanMap = {};
    latestScans.forEach(entry => {
      scanMap[entry._id] = entry.scan;
    });

    // Fetch all metadata
    const metadataList = await DeviceMetadata.find({}).lean();

    // Merge metadata and scan results
    const combined = metadataList.map(meta => {
      const scan = scanMap[meta.mac] || null;
      return {
        ...meta,
        lastScan: scan
      };
    });

    return res.status(200).json({ devices: combined });

  } catch (error) {
    console.error('[api/devices] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch devices', details: error.message });
  }
});

router.get('/:uid', verifyToken, async (req, res) => {
  const uid = req.params.uid?.trim();
  try {
    // Fetch all metadata for this uid
    const metadataList = await DeviceMetadata.find({ uid }).lean();

    // Fetch latest scan per MAC for this uid
    const macs = metadataList.map(meta => meta.mac);
    const latestScans = await DeviceScan.aggregate([
      { $match: { mac: { $in: macs } } },
      { $sort: { receivedAt: -1 } },
      { $group: { _id: '$mac', scan: { $first: '$$ROOT' } } }
    ]);

    // Index scans by MAC
    const scanMap = {};
    latestScans.forEach(entry => {
      scanMap[entry._id] = entry.scan;
    });

    // Merge metadata and scan results
    const combined = metadataList.map(meta => ({
      ...meta,
      lastScan: scanMap[meta.mac] || null
    }));

    return res.status(200).json({ devices: combined });
  } catch (error) {
    console.error('[api/devices/:uid] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch devices by uid', details: error.message });
  }
});

router.put('/update/:mac', verifyToken, async (req, res) => {
  const macAddress = req.params.mac.toUpperCase();
  const { trustLevel } = req.body;

  console.log(`[Update Trust] MAC: ${macAddress}, Trust Level: ${trustLevel}`);

  if (!['trusted', 'neutral', 'untrusted'].includes(trustLevel)) {
    return res.status(400).json({ error: 'Invalid trust level' });
  }

  try {
    const result = await DeviceMetadata.updateOne(
      { mac: macAddress },
      { $set: { trusted: trustLevel } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ message: 'Trust level updated' });
  } catch (error) {
    console.error('[Update Trust] Error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;