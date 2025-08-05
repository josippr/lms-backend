const nodeStatusChart = require('./widgets/nodesStatusChart');
const networkStatusChart = require('./widgets/networkStatusChart');
const networkUsageChart = require('./widgets/networkUsageChart');
const activeDevicesChart = require('./widgets/activeDevicesChart');

async function getDashboardData(userId) {
  const [nodeStatusData, networkStatusData, networkUsageData, activeDevicesData] = await Promise.all([
    nodeStatusChart(userId),
    networkStatusChart(userId),
    networkUsageChart(userId),
    activeDevicesChart(userId),
    // ... more charts/widgets
  ]);

  return {
    nodeStatusChart: nodeStatusData,
    networkStatusChart: networkStatusData,
    networkUsageChart: networkUsageData,
    activeDevicesChart: activeDevicesData,
    // ... more charts/widgets
  };
}

module.exports = { getDashboardData };