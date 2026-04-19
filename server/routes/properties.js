const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, authorize, generateToken } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const multerStorageCloudinary = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage
const storage = multerStorageCloudinary({
  cloudinary: cloudinary,
  folder: 'quick-stay',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
});

const upload = multer({ storage });

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      propertyType,
      amenities,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      filter.amenities = { $all: amenityList };
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const skip = (page - 1) * limit;

    const properties = await Property.find(filter)
      .populate('host', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('host', 'name avatar phone email');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/properties/user/:userId
// @desc    Get properties by user (host)
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const properties = await Property.find({ host: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/properties
// @desc    Create a property
// @access  Private (Host, Admin)
router.post('/', protect, authorize('host', 'admin'), async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      host: req.user._id
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private (Host, Admin)
router.put('/:id', protect, authorize('host', 'admin'), async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership or admin
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private (Host, Admin)
router.delete('/:id', protect, authorize('host', 'admin'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership or admin
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/properties/upload-images
// @desc    Upload property images
// @access  Private
router.post('/upload-images', protect, authorize('host', 'admin'), upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => file.secure_url);

    res.json({
      success: true,
      data: imageUrls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;