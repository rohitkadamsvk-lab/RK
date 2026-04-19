import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { getProperty, createBooking, getPropertyReviews, createReview } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FiStar, FiCalendar, FiUsers, FiHome, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'

const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  // Booking form state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    fetchProperty()
  }, [id])

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '')
      setGuestEmail(user.email || '')
    }
  }, [user])

  const fetchProperty = async () => {
    try {
      const [propertyRes, reviewsRes] = await Promise.all([
        getProperty(id),
        getPropertyReviews(id)
      ])
      setProperty(propertyRes.data.data)
      setReviews(reviewsRes.data.data)
    } catch (error) {
      toast.error('Property not found')
      navigate('/properties')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to book')
      navigate('/login')
      return
    }

    setBookingLoading(true)
    try {
      const nights = differenceInDays(new Date(checkOut), new Date(checkIn))
      await createBooking({
        propertyId: id,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        guestPhone
      })
      toast.success('Booking confirmed!')
      navigate('/my-bookings')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      await createReview({
        propertyId: id,
        rating: reviewRating,
        comment: reviewComment
      })
      toast.success('Review submitted!')
      setShowReviewForm(false)
      fetchProperty()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0
  const totalPrice = property ? property.price * nights : 0

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!property) return null

  const amenitiesList = {
    wifi: 'WiFi',
    parking: 'Free Parking',
    pool: 'Pool',
    ac: 'Air Conditioning',
    heating: 'Heating',
    kitchen: 'Kitchen',
    washer: 'Washer',
    dryer: 'Dryer',
    tv: 'TV',
    gym: 'Gym',
    'pet-friendly': 'Pet Friendly',
    'breakfast': 'Breakfast',
    'workspace': 'Workspace',
    'hot-tub': 'Hot Tub',
    'balcony': 'Balcony'
  }

  return (
    <div className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden mb-6">
          <div className="aspect-[4/3]">
            <img
              src={property.images?.[0] || 'https://via.placeholder.com/800'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(property.images?.slice(1, 5) || []).map((img, i) => (
              <div key={i} className="aspect-[4/3]">
                <img src={img} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h1>
                  <p className="text-gray-600">
                    {property.location?.city}, {property.location?.state}, {property.location?.country}
                  </p>
                </div>
                <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg">
                  <FiStar className="text-yellow-500 fill-current" />
                  <span className="font-semibold">{property.rating?.toFixed(1)}</span>
                  <span className="text-gray-500">({property.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 py-4 border-y border-gray-100">
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-gray-400" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiHome className="text-gray-400" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiHome className="text-gray-400" />
                  <span>{property.beds} beds</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiHome className="text-gray-400" />
                  <span>{property.bathrooms} baths</span>
                </div>
              </div>

              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4">About this place</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              <div className="py-6 border-t border-gray-100">
                <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities?.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2 text-gray-600">
                      <FiCheck className="text-green-500" />
                      <span>{amenitiesList[amenity] || amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-6 border-t border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  {property.location?.coordinates?.lat && (
                    <MapContainer
                      center={[property.location.coordinates.lat, property.location.coordinates.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[property.location.coordinates.lat, property.location.coordinates.lng]}>
                        <Popup>{property.location?.city}</Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div className="py-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                  {user && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {showReviewForm && (
                  <form onSubmit={handleReview} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`text-2xl ${reviewRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            <FiStar className={reviewRating >= star ? 'fill-current' : ''} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Comment</label>
                      <textarea
                        className="input-field"
                        rows="3"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary">Submit Review</button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {review.user?.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{review.user?.name}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`text-sm ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-bold">${property.price}</span>
                  <span className="text-gray-500"> / night</span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    className="input-field"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    className="input-field"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    className="input-field"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[...Array(property.maxGuests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">${property.price} x {nights} nights</span>
                    <span className="text-gray-800">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service fee</span>
                    <span className="text-gray-800">$0</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !checkIn || !checkOut}
                  className="w-full btn-primary py-3"
                >
                  {bookingLoading ? 'Booking...' : 'Reserve'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-4">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail