const express = require('express');
const IntrusionAlert = require('../../models/alert.js');
const verifyToken = require('../../middleware/verifyToken.js');
const router = express.Router();

router.get('/unresolved', verifyToken, async (req, res) => {
  const uid = req.headers['uid'];
  console.log("debug alert uid:", uid);

  if (!uid) {
    return res.status(400).json({ error: 'Missing UID in headers' });
  }

  try {
    const unresolvedAlerts = await IntrusionAlert.find({
      resolved: false,
      uid: uid,
    }).sort({ 'alert.timestamp': -1 });

    res.json(unresolvedAlerts);
  } catch (err) {
    console.error('Error fetching unresolved alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;