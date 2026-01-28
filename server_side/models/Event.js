
const mongoose = require('mongoose');
const slugify = require('slugify');

const CoordinatesSchema = new mongoose.Schema({ lat: Number, lng: Number }, { _id: false });

const LocationSchema = new mongoose.Schema({
  venue: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  country: { type: String, required: true },
  zipCode: String,
  coordinates: { type: CoordinatesSchema, default: () => ({}) }
}, { _id: false });

const OrganizerSubSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  organization: String
}, { _id: false });

const StatsSchema = new mongoose.Schema({
  totalBookings: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 }
}, { _id: false });

const ApprovalSchema = new mongoose.Schema({
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String
}, { _id: false });

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 5, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true, minlength: 20, maxlength: 5000 },
  shortDescription: { type: String, maxlength: 300 },
  category: { type: String, required: true, index: true },
  tags: { type: [String], validate: v => v.length <= 10 },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  duration: Number,
  endDate: Date,
  location: { type: LocationSchema, required: true },
  totalSeats: { type: Number, required: true, min: 1, max: 100000 },
  availableSeats: { type: Number, required: true },
  bookedSeats: { type: Number, default: 0 },
  price: { type: Number, required: true, min: 0, max: 1000000 },
  currency: { type: String, default: 'USD' },
  bannerImage: { type: String, required: true },
  images: { type: [String], validate: v => v.length <= 5 },
  videoUrl: String,
  organizer: { type: OrganizerSubSchema, required: true },
  status: { type: String, enum: ['draft','pending','approved','rejected','cancelled','completed'], default: 'pending', index: true },
  approvalStatus: { type: ApprovalSchema, default: () => ({}) },
  features: [String],
  requirements: [String],
  stats: { type: StatsSchema, default: () => ({}) },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, { timestamps: true });

EventSchema.pre('validate', function(next){
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true }).slice(0, 200);
  }
  if (this.isNew && (this.availableSeats === undefined || this.availableSeats === null)) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ 'organizer._id': 1 });
EventSchema.index({ status: 1, eventDate: 1 });
EventSchema.index({ category: 1, eventDate: 1 });
EventSchema.index({ eventDate: 1 });
EventSchema.index({ 'approvalStatus.isApproved': 1 });
EventSchema.index({ createdAt: -1 });
EventSchema.index({ 'stats.averageRating': -1 });
EventSchema.index({ title: 'text', description: 'text' }, { weights: { title: 5, description: 1 } });

module.exports = mongoose.model('Event', EventSchema);
