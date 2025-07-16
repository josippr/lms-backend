const nodeStatusChart = require('./widgets/nodesStatusChart');
const networkStatusChart = require('./widgets/networkStatusChart');

async function getDashboardData(userId) {
  const [nodeStatusData, networkStatusData] = await Promise.all([
    nodeStatusChart(userId),
    networkStatusChart(userId),
    // ... more charts/widgets
  ]);

  return {
    nodeStatusChart: nodeStatusData,
    networkStatusChart: networkStatusData,
    // ... more charts/widgets
  };
}

module.exports = { getDashboardData };