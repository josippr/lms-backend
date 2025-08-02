const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const router = express.Router();
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const auth = require('./api/auth/auth');
const devices = require('./api/devices/devices');
const registerDevice = require('./api/register-device/register-device');
const network = require('./api/network/network');
const usageMetrics = require('./api/logs/usage-metrics');
const intrusion = require('./api/network/intrusion');
const metrics = require('./api/metrics/metrics');
const profile = require('./api/profile/profile');
const data = require('./api/data/data');
const json = require('./api/json/json');
const networkStatus = require('./api/networkStatus/networkStatus');
const alert = require('./api/alert/alert');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT;

const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_ORIGINAL = process.env.MONGO_URI_ORIGINAL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

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
app.use('/api/metrics', metrics);
app.use('/api/profile', profile);
app.use('/api/data', data);
app.use('/api/networkStatus', networkStatus);
app.use('/api/alert', alert);

app.use('/api/json', (req, res, next) => {
  req.io = io;
  next();
}, json);

app.use(router);

app.get('/', (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`App + WebSocket listening on port ${port}`);
});

io.on('connection', (socket) => {
  console.log('Frontend connected via WebSocket');

  socket.on('disconnect', () => {
    console.log('Frontend disconnected');
  });
});
