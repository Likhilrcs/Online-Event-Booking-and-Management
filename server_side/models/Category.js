const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

CategorySchema.index({ name: 1, slug: 1 });

module.exports = mongoose.model('Category', CategorySchema);
