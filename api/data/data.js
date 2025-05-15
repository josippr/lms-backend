const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;
const MONGO_URL = process.env.MONGO_URI_ORIGINAL
const DB_NAME = process.env.MONGO_DB_NAME;

app.use(cors());

app.get('/api/data', async (req, res) => {
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