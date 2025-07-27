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

module.exports = router;