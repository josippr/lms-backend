const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const auth = require('./api/auth/auth');

const app = express();
const port = process.env.PORT;

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const AUTH_SOURCE = process.env.AUTH_SOURCE;

// mongoose.set('debug', true);
mongoose.connect(MONGO_URI + MONGO_DB_NAME + AUTH_SOURCE)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));


app.use(cors());
app.use(express.json());
app.use('/api/users', auth);

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});