const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URI_ORIGINAL = process.env.MONGO_URI_ORIGINAL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;
const COLLECTION_NAME = 'profiles';

// fetch profile information
router.get('/', verifyToken, async (req, res) => {
    
    try {
        // Connect if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI_ORIGINAL, {
                dbName: MONGO_DB_NAME,
                authSource: AUTH_SOURCE,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        const db = mongoose.connection.db;
        const collection = db.collection(COLLECTION_NAME);

        // No longer converting to ObjectId - using string directly
        const profile = await collection.findOne({ userId: req.user.userId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);

    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// update profile information
router.put('/', verifyToken, async (req, res) => {
    const updates = req.body;
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
        const collection = db.collection(COLLECTION_NAME);
        const result = await collection.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: updates },
            { 
                returnDocument: 'after',
                upsert: true
            }
        );

        if (!result.value && result.lastErrorObject?.updatedExisting) {
            const updatedDoc = await collection.findOne({ userId: req.user.userId });
            return res.json(updatedDoc);
        }

        res.json(result.value || updates);

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;