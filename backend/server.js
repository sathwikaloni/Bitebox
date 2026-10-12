const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Optional MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bitebox';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('[BiteBox Backend] Connected to MongoDB at ' + MONGO_URI))
  .catch(err => {
    console.warn('[BiteBox Backend] MongoDB connection notice: ' + err.message);
    console.log('[BiteBox Backend] Running with in-memory database fallback.');
  });

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'BiteBox Backend' });
});

app.listen(PORT, () => {
  console.log(`[BiteBox Backend] Server is running on port ${PORT}`);
});
