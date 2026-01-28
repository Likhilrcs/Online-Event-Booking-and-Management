const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.list = async (req, res) => {
  try {
    const { q, category, status, organizerId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (organizerId) filter['organizer._id'] = organizerId;
    if (q) filter.$text = { $search: q };

    // If user is not admin and not requesting their own events, force approved status
    // or let the frontend handle the 'status: approved' query (which it already does)

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(events);
  } catch (err) {
    console.error('List events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // Check if event is approved or if requester is admin/organizer
    if (ev.status !== 'approved') {
      const isOwner = req.user && ev.organizer._id.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'This event is pending approval' });
      }
    }

    res.json(ev);
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const data = req.body;
    data.organizer = data.organizer || {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || ''
    };

    let ev;
    await session.withTransaction(async () => {
      ev = await Event.create([data], { session });
      ev = ev[0];

      // Update organizer stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.eventsCreated': 1 }
      }, { session });
    });

    res.status(201).json(ev);
  } catch (err) {
    console.error('Create event error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (err.code === 11000) {
      if (err.keyPattern?.slug) {
        return res.status(400).json({ message: 'An event with a similar title already exists. Please choose a different title.' });
      }
      return res.status(400).json({ message: 'Duplicate field error' });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  } finally {
    session.endSession();
  }
};

exports.update = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // Check ownership
    const isOwner = req.user && ev.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    Object.assign(ev, req.body);
    await ev.save();
    res.json(ev);
  } catch (err) {
    console.error('Update event error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // Check ownership
    const isOwner = req.user && ev.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Remove event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
