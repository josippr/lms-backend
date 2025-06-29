const Profile = require('../../models/profile');
const Node = require('../../models/node');
const { Types: { ObjectId } } = require('mongoose');

module.exports = async function nodeStatusData(userId) {
  const isObjectId = ObjectId.isValid(userId) && new ObjectId(userId).toString() === userId;

  const query = isObjectId 
    ? { userId: new ObjectId(userId) } 
    : { userId: userId };

  const profile = await Profile.findOne(query);

  if (!profile) {
    console.warn(`No profile found for userId: ${userId}`);
    return [];
  }

  if (!Array.isArray(profile.linkedNodes) || profile.linkedNodes.length === 0) {
    console.warn(`No linked nodes found for userId: ${userId}. Profile linkedNodes:`, profile.linkedNodes);
    return [];
  }
  
  const nodes = await Node.find(
    { uid: { $in: profile.linkedNodes } },
    {
      uid: 1,
      lastSync: 1,
      DeviceName: 1,
      Type: 1,
      _id: 0
    }
  ).lean();

  return nodes.map(node => ({
    nodeId: node.uid,
    deviceName: node.DeviceName,
    lastSync: node.lastSync,
    type: node.Type,
  }));
};