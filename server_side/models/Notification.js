const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: String,
  message: String,
  type: String,
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  sentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
