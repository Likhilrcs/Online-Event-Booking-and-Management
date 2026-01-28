const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const updatable = ['name', 'phone', 'profileImage', 'preferences', 'address'];
    updatable.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: list users
exports.list = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete user
exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalBookings] = await Promise.all([
      User.countDocuments(),
      require('../models/Event').countDocuments(),
      require('../models/Booking').countDocuments()
    ]);

    // Simple revenue calculation (sum of all booking totalAmounts)
    const bookings = await require('../models/Booking').find();
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      users: totalUsers,
      events: totalEvents,
      bookings: totalBookings,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
