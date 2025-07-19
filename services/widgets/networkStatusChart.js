const NetworkStatus = require('../../models/networkStatus');
const Profile = require('../../models/profile');
const { Types: { ObjectId } } = require('mongoose');

module.exports = async function networkStatusData(userId) {
  const isObjectId = ObjectId.isValid(userId) && new ObjectId(userId).toString() === userId;

  // fetch profile, and extract uid (deviceId) from it
  const queryProfile = isObjectId 
      ? { userId: new ObjectId(userId) } 
      : { userId: userId };
  
  const profile = await Profile.findOne(queryProfile);

  let uid = null;

  if (profile) {
    uid = profile.linkedNodes?.[0]; // always string
  }
  const query = { deviceId: uid };
  const latest = await NetworkStatus.findOne(query).sort({ timestamp: -1 });

  if (!latest) {
    console.warn(`[networkStatusData] No network status data found for userId: ${uid}`);
    return null;
  }

  const ns = latest.payload?.networkStatus || {};
  const jitter = ns.jitterMs ?? null;
  const loss = ns.packetLossPercent ?? null;
  const bandwidth = ns.bandwidthKbps ?? null;

  // Derive network status
  let status = 'unknown';
  if (jitter !== null && loss !== null && bandwidth !== null) {
    if (loss > 20 || jitter > 10000 || bandwidth < 100) {
      status = 'poor';
    } else if (loss > 5 || jitter > 3000 || bandwidth < 2000) {
      status = 'moderate';
    } else {
      status = 'good';
    }
  }

  return {
    timestamp: latest.timestamp,
    deviceId: latest.deviceId,
    networkParams: {
      bandwidthKbps: bandwidth,
      packetLossPercent: loss,
      jitterMs: jitter,
      deviceCount: ns.deviceCount ?? 0,
      activeDevices: ns.activeDevices ?? [],
      outOfOrderCount: ns.outOfOrderCount ?? null,
    },
    status: status,
  };
}
