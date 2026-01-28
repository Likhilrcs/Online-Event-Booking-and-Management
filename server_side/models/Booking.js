
const mongoose = require('mongoose');

const UserSubSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String }
}, { _id: false });

const EventSubSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  eventDate: { type: Date, required: true },
  location: { type: String, required: true },
  bannerImage: String
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  method: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'google_pay', 'stripe'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending', index: true },
  transactionId: { type: String, index: true },
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number
}, { _id: false });

const CancellationSchema = new mongoose.Schema({
  isCancelled: { type: Boolean, default: false },
  cancelledAt: Date,
  cancelledBy: { type: String, enum: ['user', 'organizer', 'admin'] },
  cancellationReason: String,
  refundStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'] }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: UserSubSchema, required: true },
  event: { type: EventSubSchema, required: true },
  numberOfSeats: { type: Number, required: true, min: 1, max: 10 },
  pricePerSeat: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  payment: { type: PaymentSchema, required: true },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'], default: 'confirmed', index: true },
  ticketCode: { type: String, required: true, unique: true },
  qrCode: String,
  ticketPDF: String,
  cancellation: { type: CancellationSchema, default: () => ({}) },
  bookedAt: { type: Date, default: Date.now },
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    feedbackRequested: { type: Boolean, default: false }
  },
  specialRequests: { type: String, maxlength: 500 },
  attendeeNames: [String]
}, { timestamps: true });

// Indexes
BookingSchema.index({ bookingId: 1 }, { unique: true });
BookingSchema.index({ 'user._id': 1 });
BookingSchema.index({ 'event._id': 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'payment.status': 1 });
BookingSchema.index({ ticketCode: 1 }, { unique: true });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ 'user._id': 1, status: 1 });
BookingSchema.index({ 'event._id': 1, status: 1 });

// compute totalAmount
BookingSchema.pre('validate', function (next) {
  this.totalAmount = this.numberOfSeats * this.pricePerSeat;
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
