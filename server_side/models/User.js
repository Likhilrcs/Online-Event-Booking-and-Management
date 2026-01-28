
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const PreferencesSchema = new mongoose.Schema({
  notifications: { type: Boolean, default: true },
  newsletter: { type: Boolean, default: false },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' }
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String
}, { _id: false });

const StatsSchema = new mongoose.Schema({
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  eventsCreated: { type: Number, default: 0 }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 100, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: { validator: (v) => validator.isEmail(v), message: 'Invalid email' }
  },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['guest','user','organizer','admin'], default: 'user', index: true },
  phone: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  preferences: { type: PreferencesSchema, default: () => ({}) },
  address: { type: AddressSchema, default: () => ({}) },
  stats: { type: StatsSchema, default: () => ({}) }
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
