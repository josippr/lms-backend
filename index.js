const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = express.Router();
require('dotenv').config();

const auth = require('./api/auth/auth');
const devices = require('./api/devices/devices');

const app = express();
const port = process.env.PORT;

const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_ORIGINAL = process.env.MONGO_URI_ORIGINAL;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;

// mongoose.set('debug', true);
mongoose.connect(MONGO_URI_ORIGINAL + MONGO_DB_NAME + AUTH_SOURCE)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));


app.use(cors());
app.use(express.json());
app.use(router);
app.use('/api/users', auth);
app.use('/api/devices', devices);

app.get('/', (req, res) => {
  res.send("Hello World!!!!!! How are you?");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});