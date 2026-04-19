const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Add a review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    // Check if user has actually booked this property
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      property: propertyId,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!hasBooked) {
      return res.status(403).json({
        success: false,
        message: 'You must book this property before leaving a review'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user._id,
      property: propertyId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this property'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      property: propertyId,
      rating,
      comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reviews/property/:propertyId
// @desc    Get reviews for a property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only review owner or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;