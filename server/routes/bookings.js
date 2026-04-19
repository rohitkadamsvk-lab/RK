const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }

    // Get property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ success: false, message: 'Property is not available' });
    }

    if (guests > property.maxGuests) {
      return res.status(400).json({ success: false, message: `Maximum ${property.maxGuests} guests allowed` });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ success: false, message: 'Property is not available for selected dates' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property.price * nights;

    // Mock payment - in production, integrate with Stripe here
    const booking = await Booking.create({
      user: req.user._id,
      property: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      status: 'confirmed', // Auto-confirm for demo
      paymentStatus: 'paid',
      paymentId: `mock_${Date.now()}`
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('property', 'title location images price');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/user/:userId
// @desc    Get user's bookings
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Only allow users to view their own bookings or admin
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({ user: req.params.userId })
      .populate('property', 'title location images price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/property/:propertyId
// @desc    Get bookings for a property (for hosts)
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only property host or admin can view bookings
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({ property: req.params.propertyId })
      .populate('user', 'name email phone')
      .sort({ checkIn: 1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('property', 'title location images price host');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only booking owner, property host, or admin can view
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isPropertyHost = booking.property.host.toString() === req.user._id.toString();

    if (!isOwner && !isPropertyHost && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only booking owner can cancel
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Can't cancel completed bookings
    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });
    }

    // Can't cancel if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark booking as completed (for check-out)
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'host');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only property host or admin can mark as completed
    if (booking.property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({ success: true, message: 'Booking completed', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;