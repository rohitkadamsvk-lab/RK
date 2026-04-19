const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// @route   GET /api/wishlist/:userId
// @desc    Get user's wishlist
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    // Only allow users to view their own wishlist
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let wishlist = await Wishlist.findOne({ user: req.params.userId })
      .populate('properties');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.params.userId, properties: [] });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wishlist
// @desc    Add property to wishlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, properties: [propertyId] });
    } else {
      // Check if property already in wishlist
      if (wishlist.properties.includes(propertyId)) {
        return res.status(400).json({ success: false, message: 'Property already in wishlist' });
      }

      wishlist.properties.push(propertyId);
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('properties');

    res.json({ success: true, data: populatedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/wishlist/:propertyId
// @desc    Remove property from wishlist
// @access  Private
router.delete('/:propertyId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.properties = wishlist.properties.filter(
      p => p.toString() !== req.params.propertyId
    );
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('properties');

    res.json({ success: true, data: populatedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/wishlist/check/:propertyId
// @desc    Check if property is in wishlist
// @access  Private
router.get('/check/:propertyId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist
      ? wishlist.properties.includes(req.params.propertyId)
      : false;

    res.json({ success: true, isInWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;