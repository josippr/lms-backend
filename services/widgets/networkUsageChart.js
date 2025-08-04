const { Types: { ObjectId } } = require('mongoose');
const Profile = require('../../models/profile');
const NetworkStatus = require('../../models/networkStatus');

module.exports = async function networkUsageData(userId) {
  // Validate userId
  const isObjectId = ObjectId.isValid(userId) && new ObjectId(userId).toString() === userId;
  const queryProfile = isObjectId ? { userId: new ObjectId(userId) } : { userId };

  // Get user's linked deviceId
  const profile = await Profile.findOne(queryProfile);
  const deviceId = profile?.linkedNodes?.[0] ?? null;
  console.log("debug deviceId: ", deviceId);
  if (!deviceId) {
    console.warn(`[networkUsageData] No linkedNodes found for userId: ${userId}`);
    return null;
  }

  // Define time range: last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Fetch documents with matching deviceId and timestamp in last 24 hours
  const hourlyDocs = await NetworkStatus.find({
    deviceId,
    timestamp: { $gte: oneDayAgo }
  }).sort({ timestamp: 1 }); // Optional: sort by time

  console.log("debug hourlyDocs count:", hourlyDocs.length);

  // Extract bandwidth data
  const bandwidthData = hourlyDocs.map(doc => ({
    timestamp: doc.timestamp,
    bandwidth: doc.payload?.networkStatus?.bandwidthKbps ?? null
  }));

  console.log("debug bandwidthData:", bandwidthData);

  return bandwidthData;
};
