import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserBookings, cancelBooking } from '../services/api'
import { FiCalendar, FiX, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      const { data } = await getUserBookings(user._id)
      setBookings(data.data)
    } catch (error) {
      toast.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await cancelBooking(bookingId)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true
    return booking.status === activeTab
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="text-green-500" />
      case 'pending':
        return <FiClock className="text-yellow-500" />
      case 'cancelled':
        return <FiXCircle className="text-red-500" />
      case 'completed':
        return <FiCheckCircle className="text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your bookings</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FiCalendar className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No bookings found</p>
            <Link to="/properties" className="text-primary-600 hover:text-primary-700 font-medium">
              Explore properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={booking.property?.images?.[0] || 'https://via.placeholder.com/200'}
                      alt={booking.property?.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <Link
                        to={`/properties/${booking.property?._id}`}
                        className="font-semibold text-gray-800 hover:text-primary-600"
                      >
                        {booking.property?.title}
                      </Link>
                      <p className="text-gray-500 text-sm">
                        {booking.property?.location?.city}, {booking.property?.location?.state}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>
                          {format(new Date(booking.checkIn), 'MMM d, yyyy')} -{' '}
                          {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                        </span>
                        <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </span>
                    <span className="font-bold text-lg">${booking.totalPrice}</span>
                  </div>
                </div>

                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings