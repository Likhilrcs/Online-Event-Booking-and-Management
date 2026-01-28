const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  body: { type: String, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ event: 1, rating: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
