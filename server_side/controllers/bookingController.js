const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');
const shortid = require('shortid');

const generateTicketCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.create = async (req, res) => {
  const { eventId, numberOfSeats, payment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  const session = await mongoose.startSession();
  try {
    let savedBooking;
    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);
      const user = await User.findById(req.user._id).session(session);

      if (!event) throw new Error('Event not found');
      if (!user) throw new Error('User not found');
      if (event.availableSeats < numberOfSeats) throw new Error('Not enough seats available');

      // Update event
      event.availableSeats -= numberOfSeats;
      event.bookedSeats = (event.bookedSeats || 0) + numberOfSeats;

      if (!event.stats) event.stats = {};
      event.stats.totalBookings = (event.stats.totalBookings || 0) + numberOfSeats;
      event.stats.totalRevenue = (event.stats.totalRevenue || 0) + (numberOfSeats * event.price);
      await event.save({ session });

      // Create booking
      const booking = new Booking({
        bookingId: `BK-${shortid.generate()}`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        },
        event: {
          _id: event._id,
          title: event.title || 'Untitled Event',
          eventDate: event.eventDate || new Date(),
          location: (event.location && event.location.venue) || 'Online/TBA',
          bannerImage: event.bannerImage
        },
        numberOfSeats,
        pricePerSeat: event.price,
        totalAmount: numberOfSeats * event.price,
        payment: payment || { method: 'stripe', status: 'completed' },
        status: 'confirmed',
        ticketCode: generateTicketCode()
      });
      await booking.save({ session });

      // Update user stats
      if (!user.stats) user.stats = {};
      user.stats.totalBookings = (user.stats.totalBookings || 0) + numberOfSeats;
      user.stats.totalSpent = (user.stats.totalSpent || 0) + booking.totalAmount;
      await user.save({ session });

      savedBooking = booking;
    });

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error('Booking creation error:', err);
    // Determine appropriate status code
    let status = 500;
    if (err.message.includes('not found')) status = 404;
    else if (err.message.includes('seats')) status = 400;
    else if (err.name === 'ValidationError') status = 400;

    res.status(status).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

exports.userBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 'user._id': req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancel = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(req.params.id).session(session);
      if (!booking) throw new Error('Booking not found');
      if (booking.status === 'cancelled') throw new Error('Already cancelled');

      booking.cancellation = { isCancelled: true, cancelledAt: new Date(), cancelledBy: 'user' };
      booking.status = 'cancelled';
      await booking.save({ session });

      const event = await Event.findById(booking.event._id).session(session);
      if (event) {
        event.availableSeats = Math.min(event.totalSeats, event.availableSeats + booking.numberOfSeats);
        event.bookedSeats = Math.max(0, (event.bookedSeats || 0) - booking.numberOfSeats);
        if (event.stats) {
          event.stats.totalRevenue = Math.max(0, (event.stats.totalRevenue || 0) - booking.totalAmount);
        }
        await event.save({ session });
      }
    });

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Booking cancellation error:', err);
    let status = 500;
    if (err.message.includes('not found')) status = 404;
    else if (err.message.includes('Already')) status = 400;
    res.status(status).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// Admin: list all bookings
exports.listAll = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete booking
exports.remove = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
