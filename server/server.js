const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
mongoose.connect('mongodb+srv://admin:1234@cluster0.t6hfq.mongodb.net/face-reg?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Register routes
app.use('/api', require('./routes/register'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
