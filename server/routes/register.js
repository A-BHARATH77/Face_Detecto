const express = require('express');
const router = express.Router();
const User = require('../models/User');
const getFaceEmbedding = require('../utils/getFaceEmbedding'); 
const axios = require("axios");
const multer = require("multer");
const upload = multer();
const FormData = require("form-data");
const activeControllers = new Set();


// Check if name exists (for real-time check)
router.get('/check-name', async (req, res) => {
    const name = req.query.name;
    try {
      const exists = await User.exists({ name });
      res.json({ exists: !!exists }); // ✅ this must return { exists: true/false }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
router.post('/register', async (req, res) => {
    const { name, image } = req.body;
    if (!name || !image) return res.status(400).json({ message: "Name and image are required" });
  
    const existing = await User.findOne({ name });
    if (existing) return res.status(409).json({ message: "Name already exists" });
  
    try {
      const embedding = await getFaceEmbedding(image);
      const newUser = new User({ name, embedding });
      await newUser.save();
      res.json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || "Embedding failed or server error" });
    }
  });
    router.post("/recognize", upload.single("image"), async (req, res) => {
    console.log("🔁 Node: Received image from frontend");
  
    try {
      const formData = new FormData();
      console.log("inside")
      formData.append("image", req.file.buffer, {
        filename: "frame.jpg",
        contentType: req.file.mimetype,
      });
      const response = await axios.post("http://localhost:8000/recognize", formData, {
        headers: formData.getHeaders(),
      });
      console.log("✅ Node: Forwarded to Flask and got response");
      res.json(response.data);
    } catch (err) {
      console.error("❌ Node: Error calling Flask service:", err.message);
      res.status(500).send("Recognition failed");
    }
  });

  router.post('/chat', async (req, res) => {
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
 
module.exports = router;