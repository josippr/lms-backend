const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const mongoose = require('mongoose');

const MONGO_URI_ORIGINAL = process.env.MONGO_URI_ORIGINAL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;
const collectionName = 'devices-metrics';

router.get('/:uid', verifyToken, async (req, res) => {
    const uid = req.params.uid?.trim();

    if (!uid) {
        return res.status(400).json({ message: 'UID parameter is required' });
    }

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI_ORIGINAL, {
                dbName: MONGO_DB_NAME,
                authSource: AUTH_SOURCE,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        const db = mongoose.connection.db;
        const collection = db.collection(collectionName);

        console.log(`Searching for UID: ${uid}`);

        const results = await collection
            .find({ uid: uid })
            .sort({ receivedAt: -1 })
            .limit(1)
            .toArray();
        console.log(`Found ${results.length} metrics for UID: ${uid}. Results:`, results);

        if (!results.length) {
            return res.status(404).json({ message: `No metrics found for UID: ${uid}` });
        }

        res.json(results[0]);

    } catch (err) {
        console.error('Error while fetching metrics:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router;
