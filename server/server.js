const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
//const allowedOrigins = ['https://face-detecto.vercel.app'];
app.use(cors({
  origin: 'http://localhost:3000' 
}));
/*app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));*/
app.use(express.json({ limit: '10mb' }));

//mongodb://localhost:27017/face_reg
//mongodb+srv://admin:1234@cluster0.t6hfq.mongodb.net/face_reg?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect('mongodb://localhost:27017/face_reg', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use('/api', require('./routes/register'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));