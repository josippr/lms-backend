const nodeStatusChart = require('./widgets/nodesStatusChart');

async function getDashboardData(userId) {
  const [nodeStatusData] = await Promise.all([
    nodeStatusChart(userId),
    // ... more charts/widgets
  ]);

  return {
    nodeStatusChart: nodeStatusData,
    // ... more charts/widgets
  };
}

module.exports = { getDashboardData };