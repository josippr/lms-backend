const express = require('express');
const router = express.Router();
const dashboardService = require('../../services/dashboardService');
const verifyToken = require('../../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  
  try {
    const data = await dashboardService.getDashboardData(req.user.userId);
    res.json(data);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;