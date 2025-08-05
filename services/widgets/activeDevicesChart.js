const { Types: { ObjectId } } = require('mongoose');
const Profile = require('../../models/profile');
const NetworkStatus = require('../../models/networkStatus');

module.exports = async function activeDevicesChartData(userId) {
  // Validate userId
  const isObjectId = ObjectId.isValid(userId) && new ObjectId(userId).toString() === userId;
  const queryProfile = isObjectId ? { userId: new ObjectId(userId) } : { userId };

  // Get user's linked deviceId
  const profile = await Profile.findOne(queryProfile);
  const deviceId = profile?.linkedNodes?.[0] ?? null;
  console.log("debug deviceId: ", deviceId);
  if (!deviceId) {
    console.warn(`[activeDevicesChartData] No linkedNodes found for userId: ${userId}`);
    return null;
  }

  // fetch latest document and set active devices count
  const latestDoc = await NetworkStatus.findOne({ deviceId }).sort({ timestamp: -1 });
  const activeDevicesData = latestDoc?.payload?.networkStatus?.activeDevices?.length ?? 0;


  console.log("debug activeDevicesData:", activeDevicesData);

  return activeDevicesData;
}