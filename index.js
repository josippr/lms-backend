const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const router = express.Router();
require('dotenv').config();

const auth = require('./api/auth/auth');
const devices = require('./api/devices/devices');
const registerDevice = require('./api/register-device/register-device');
const network = require('./api/network/network');
const usageMetrics = require('./api/logs/usage-metrics');
const intrusion = require('./api/network/intrusion');

const app = express();
const port = process.env.PORT;

const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_ORIGINAL = process.env.MONGO_URI_ORIGINAL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;

// 10 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

// mongoose.set('debug', true);
mongoose.connect(MONGO_URI_ORIGINAL + MONGO_DB_NAME + AUTH_SOURCE)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));


app.use(cors());
app.use(express.json());

app.use('/api/users', auth);
app.use('/api/devices', devices);
app.use('/api/register-device', registerDevice, limiter);
app.use('/api/network', network);
app.use('/api/network/intrusion', intrusion);
app.use('/api/logs', usageMetrics);

app.use(router);

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});