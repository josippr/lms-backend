const nodeStatusChart = require('./widgets/nodesStatusChart');
const networkStatusChart = require('./widgets/networkStatusChart');
const networkUsageChart = require('./widgets/networkUsageChart');

async function getDashboardData(userId) {
  const [nodeStatusData, networkStatusData, networkUsageData] = await Promise.all([
    nodeStatusChart(userId),
    networkStatusChart(userId),
    networkUsageChart(userId),
    // ... more charts/widgets
  ]);

  return {
    nodeStatusChart: nodeStatusData,
    networkStatusChart: networkStatusData,
    networkUsageChart: networkUsageData,
    // ... more charts/widgets
  };
}

module.exports = { getDashboardData };