const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a user']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Booking must have a property']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    type: Number,
    required: true,
    min: [1, 'At least 1 guest is required'],
    max: { type: Number, validate: { validator: Number.isInteger } }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String,
    required: true
  },
  specialRequests: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Validate check-out is after check-in
bookingSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

// Index for availability check
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);