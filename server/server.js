const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
//app.use(cors());
const allowedOrigins = ['https://face-detecto.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
//mongodb://localhost:27017/face_reg
//mongodb+srv://admin:1234@cluster0.t6hfq.mongodb.net/face_reg?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect('mongodb+srv://admin:1234@cluster0.t6hfq.mongodb.net/face_reg?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Register routes
app.use('/api', require('./routes/register'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
