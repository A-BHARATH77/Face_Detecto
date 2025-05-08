// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000' // Allow your React app
}));

app.use(express.json());

// Proxy endpoint to Flask
app.post('/chat', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5001/ask', {
      query: req.body.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Flask API error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
});

const PORT = 4000; // Different from Flask and React
app.listen(PORT, () => {
  console.log(`Node server running on http://localhost:${PORT}`);
});