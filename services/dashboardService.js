const nodeStatusChart = require('./widgets/nodesStatusChart');
const networkStatusChart = require('./widgets/networkStatusChart');
const networkUsageChart = require('./widgets/networkUsageChart');
const activeDevicesChart = require('./widgets/activeDevicesChart');
const speedtestChart = require('./widgets/speedtestChart');

async function getDashboardData(userId) {
  const [nodeStatusData, networkStatusData, networkUsageData, activeDevicesData, speedtestData] = await Promise.all([
    nodeStatusChart(userId),
    networkStatusChart(userId),
    networkUsageChart(userId),
    activeDevicesChart(userId),
    speedtestChart(userId),
    // ... more charts/widgets
  ]);

  return {
    nodeStatusChart: nodeStatusData,
    networkStatusChart: networkStatusData,
    networkUsageChart: networkUsageData,
    activeDevicesChart: activeDevicesData,
    speedtestChart: speedtestData,
    // ... more charts/widgets
  };
}

module.exports = { getDashboardData };