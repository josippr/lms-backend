const express = require('express');
const { MongoClient } = require('mongodb');
const verifyToken = require('../../middleware/verifyToken');
require('dotenv').config();

const router = express.Router();
const MONGO_URL = process.env.MONGO_URI_ORIGINAL;
const DB_NAME = process.env.MONGO_DB_NAME;

router.get('/', verifyToken, async (req, res) => {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const collections = await db.listCollections().toArray();
    const result = {};

    for (const col of collections) {
      const name = col.name;
      const documents = await db.collection(name).find({}).toArray();
      result[name] = documents;
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  } finally {
    await client.close();
  }
});

module.exports = router;
