const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must have a host']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'hotel', 'villa', 'cottage', 'studio']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: true,
    min: [1, 'Must allow at least 1 guest']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: [0, 'Bedrooms cannot be negative']
  },
  beds: {
    type: Number,
    required: true,
    min: [0, 'Beds cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: true,
    min: [0, 'Bathrooms cannot be negative']
  },
  amenities: [{
    type: String,
    enum: [
      'wifi', 'parking', 'pool', 'ac', 'heating', 'kitchen',
      'washer', 'dryer', 'tv', 'gym', 'pet-friendly', 'smoking-allowed',
      'breakfast', 'workspace', 'air-conditioning', 'hot-tub', 'balcony'
    ]
  }],
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ rating: -1 });

// Virtual for address
propertySchema.virtual('address').get(function() {
  return `${this.location.city}, ${this.location.state}, ${this.location.country}`;
});

module.exports = mongoose.model('Property', propertySchema);