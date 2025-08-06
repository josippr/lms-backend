const { Types: { ObjectId } } = require('mongoose');
const Profile = require('../../models/profile');
const Speedtest = require('../../models/speedtest');

module.exports = async function speedtestChartData(userId) {
  // Validate userId
  const isObjectId = ObjectId.isValid(userId) && new ObjectId(userId).toString() === userId;
  const queryProfile = isObjectId ? { userId: new ObjectId(userId) } : { userId };

  // Get user's linked deviceId
  const profile = await Profile.findOne(queryProfile);
  const deviceId = profile?.linkedNodes?.[0] ?? null;
  console.log("debug deviceId: ", deviceId);
  if (!deviceId) {
    console.warn(`[speedtestChartData] No linkedNodes found for userId: ${userId}`);
    return null;
  }

  // Fetch latest speedtest results
  const latestSpeedtest = await Speedtest.findOne({ deviceId }).sort({ timestamp: -1 });
  console.log("debug latestSpeedtest:", latestSpeedtest);
  
  if (!latestSpeedtest) {
    console.warn(`[speedtestChartData] No speedtest data found for deviceId: ${deviceId}`);
    return null;
  }

  const speedtestData = {
    download: latestSpeedtest.payload.speedtest.download_mbps,
    upload: latestSpeedtest.payload.speedtest.upload_mbps,
    latency: latestSpeedtest.payload.speedtest.ping_ms,
    timestamp: latestSpeedtest.timestamp,
    server: latestSpeedtest.payload.speedtest.server,
  };

  console.log("debug speedtestData:", speedtestData);

  return speedtestData;
}