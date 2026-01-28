const Review = require('../models/Review');
const Event = require('../models/Event');

exports.listForEvent = async (req, res) => {
    try {
        const reviews = await Review.find({ event: req.params.eventId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { eventId, rating, title, body } = req.body;
        const review = await Review.create({ event: eventId, user: req.user._id, rating, title, body });
        // optional: update event stats (could be done in background)
        const agg = await Review.aggregate([
            { $match: { event: req.user._id ? req.body.eventId : eventId } },
            { $group: { _id: '$event', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        if (agg && agg.length) {
            await Event.findByIdAndUpdate(eventId, { 'stats.averageRating': agg[0].avg, 'stats.totalReviews': agg[0].count });
        }
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
