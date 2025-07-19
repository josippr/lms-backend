const NetworkStatus = require('../../models/networkStatus');
const Profile = require('../../models/profile');
const { Types: { ObjectId } } = require('mongoose');

function classifyNetworkStatus({ jitter, loss, bandwidth, latency }) {
  if (loss > 20 || jitter > 10000 || bandwidth < 100 || latency > 1000) return 'poor';
  if (loss > 5 || jitter > 3000 || bandwidth < 2000 || latency > 300) return 'moderate';
  return 'good';
}

function getWorstMetric({ jitter, loss, bandwidth, latency }) {
  const issues = [];

  if (loss > 20) issues.push({ key: 'Packet Loss', value: loss, severity: 3 });
  else if (loss > 5) issues.push({ key: 'Packet Loss', value: loss, severity: 2 });

  if (jitter > 10000) issues.push({ key: 'Jitter', value: jitter, severity: 3 });
  else if (jitter > 3000) issues.push({ key: 'Jitter', value: jitter, severity: 2 });

  if (bandwidth < 100) issues.push({ key: 'Bandwidth', value: bandwidth, severity: 3 });
  else if (bandwidth < 2000) issues.push({ key: 'Bandwidth', value: bandwidth, severity: 2 });

  if (latency > 1000) issues.push({ key: 'Latency', value: latency, severity: 3 });
  else if (latency > 300) issues.push({ key: 'Latency', value: latency, severity: 2 });

  if (issues.length === 0) return null;

  issues.sort((a, b) => b.severity - a.severity);
  return `${issues[0].key} (${issues[0].value})`;
}

const HARD_CAPS = { jitterMs: 1000 };
function removeOutliersIQR(arr) {
  if (arr.length < 4) return arr;
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.ceil((sorted.length * 3) / 4)];
  const iqr = q3 - q1;
  const min = q1 - 1.5 * iqr;
  const max = q3 + 1.5 * iqr;
  return arr.filter(val => val >= min && val <= max);
}

module.exports = async function networkStatusData(userId) {
  const isObjectId = ObjectId.isValid(userId) && new ObjectId(userId).toString() === userId;
  const queryProfile = isObjectId ? { userId: new ObjectId(userId) } : { userId };

  const profile = await Profile.findOne(queryProfile);
  const uid = profile?.linkedNodes?.[0] ?? null;

  if (!uid) {
    console.warn(`[networkStatusData] No linkedNodes found for userId: ${userId}`);
    return null;
  }

  const query = { deviceId: uid };
  const latest = await NetworkStatus.findOne(query).sort({ timestamp: -1 });

  if (!latest) {
    console.warn(`[networkStatusData] No network status found for deviceId: ${uid}`);
    return null;
  }

  const ns = latest.payload?.networkStatus || {};
  const jitter = ns.jitterMs ?? null;
  const loss = ns.packetLossPercent ?? null;
  const bandwidth = ns.bandwidthKbps ?? null;
  const latency = ns.pingLatencyMs ?? null;

  const latestStatus = (jitter !== null && loss !== null && bandwidth !== null)
    ? classifyNetworkStatus({ jitter, loss, bandwidth, latency })
    : 'unknown';

  const latestCause = getWorstMetric({ jitter, loss, bandwidth, latency });
  const latestMessage = latestStatus === 'good'
    ? 'Current network status is good. No significant issues detected.'
    : `Current network status is ${latestStatus}. Main cause for this is ${latestCause}.`;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const hourlyDocs = await NetworkStatus.find({
    deviceId: uid,
    timestamp: { $gte: oneHourAgo }
  });

  const stats = { jitter: [], loss: [], bandwidth: [], latency: [] };

  for (const doc of hourlyDocs) {
    const data = doc.payload?.networkStatus;
    if (!data) continue;
    if (typeof data.jitterMs === 'number' && data.jitterMs <= HARD_CAPS.jitterMs) stats.jitter.push(data.jitterMs);
    if (typeof data.packetLossPercent === 'number') stats.loss.push(data.packetLossPercent);
    if (typeof data.bandwidthKbps === 'number') stats.bandwidth.push(data.bandwidthKbps);
    if (typeof data.pingLatencyMs === 'number') stats.latency.push(data.pingLatencyMs);
  }

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const avgJitter = avg(stats.jitter);
  const avgLoss = avg(stats.loss);
  const avgBandwidth = avg(stats.bandwidth);
  const avgLatency = avg(stats.latency);

  const hourlyStatus = (avgJitter !== null && avgLoss !== null && avgBandwidth !== null)
    ? classifyNetworkStatus({ jitter: avgJitter, loss: avgLoss, bandwidth: avgBandwidth, latency: avgLatency })
    : 'unknown';

  const hourlyCause = getWorstMetric({
    jitter: avgJitter,
    loss: avgLoss,
    bandwidth: avgBandwidth,
    latency: avgLatency
  });
  const hourlyMessage = hourlyStatus === 'good'
    ? 'Current network status is good. No significant issues detected.'
    : `Current network status is ${hourlyStatus}. Main cause for this is ${hourlyCause}.`;

  return {
    deviceId: uid,
    timestamp: latest.timestamp,
    latest: {
      status: latestStatus,
      message: latestMessage,
      networkParams: {
        bandwidthKbps: bandwidth,
        packetLossPercent: loss,
        jitterMs: jitter,
        pingLatencyMs: latency,
        deviceCount: ns.deviceCount ?? 0,
        activeDevices: ns.activeDevices ?? [],
        outOfOrderCount: ns.outOfOrderCount ?? null,
      }
    },
    hourlyAverage: {
      status: hourlyStatus,
      message: hourlyMessage,
      sampleCount: hourlyDocs.length,
      expectedSamples: 12,
      isDataIncomplete: hourlyDocs.length < 8,
      networkParams: {
        avgBandwidthKbps: avgBandwidth !== null ? +avgBandwidth.toFixed(2) : null,
        avgPacketLossPercent: avgLoss !== null ? +avgLoss.toFixed(2) : null,
        avgJitterMs: avgJitter !== null ? +avgJitter.toFixed(2) : null,
        avgPingLatencyMs: avgLatency !== null ? +avgLatency.toFixed(2) : null,
      }
    }
  };
};
