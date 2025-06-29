const express = require('express');
const router = express.Router();
const dashboardService = require('../../services/dashboardService');
const verifyToken = require('../../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  
  try {
    console.log("\n------------------------------------------------------------\ndebug debug - Received request to fetch dashboard data for user:", req.user.userId);
    console.log("DEBUG: User object:", req.user);
    
    const data = await dashboardService.getDashboardData(req.user.userId);
    console.log("DEBUG: Dashboard data returned:", JSON.stringify(data, null, 2));
    
    res.json(data);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;