const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    embedding: { type: [Number], required: true }, // Array of 128 numbers (FaceNet)
  }, {
    timestamps: true  
  })
module.exports = mongoose.model('User', userSchema);
