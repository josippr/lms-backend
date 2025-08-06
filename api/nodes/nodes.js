const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const mongoose = require('mongoose');
const Node = require('../../models/node');

const MONGO_URI_ORIGINAL = process.env.MONGO_URI_ORIGINAL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;
const collectionName = 'nodes';

// based on provided uid, fetch nodes with that uid
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

        const nodes = await Node.find({ uid }).lean();

        if (!nodes.length) {
            return res.status(404).json({ message: `No nodes found for UID: ${uid}` });
        }

        res.json(nodes);

    } catch (err) {
        console.error('Error while fetching nodes:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;