const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a user']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Review must have a property']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// One review per user per property
reviewSchema.index({ user: 1, property: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function(propertyId) {
  const stats = await this.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: '$property',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Property').findByIdAndUpdate(propertyId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count
    });
  } else {
    await mongoose.model('Property').findByIdAndUpdate(propertyId, {
      rating: 0,
      reviewCount: 0
    });
  }
};

// After save, update property rating
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.property);
});

// After remove, update property rating
reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.property);
  }
});

module.exports = mongoose.model('Review', reviewSchema);