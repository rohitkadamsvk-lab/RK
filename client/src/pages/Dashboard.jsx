import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProperties, getUserBookings, deleteProperty, updateProperty } from '../services/api'
import { FiPlus, FiEdit, FiTrash2, FiHome, FiCalendar, FiUsers, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('properties')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        getUserProperties(user._id),
        getUserBookings(user._id)
      ])
      setProperties(propertiesRes.data.data)
      setBookings(bookingsRes.data.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      await deleteProperty(propertyId)
      toast.success('Property deleted')
      setProperties(properties.filter(p => p._id !== propertyId))
    } catch (error) {
      toast.error('Failed to delete property')
    }
  }

  const toggleAvailability = async (property) => {
    try {
      await updateProperty(property._id, { isAvailable: !property.isAvailable })
      toast.success(`Property ${property.isAvailable ? 'unlisted' : 'listed'}`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update property')
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view dashboard</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user.name}</p>
          </div>
          {(user.role === 'host' || user.role === 'admin') && (
            <Link to="/add-property" className="btn-primary flex items-center space-x-2 mt-4 md:mt-0">
              <FiPlus />
              <span>Add Property</span>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiHome className="text-primary-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-gray-500 text-sm">Properties</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCalendar className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-gray-500 text-sm">Active Bookings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCalendar className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</p>
                <p className="text-gray-500 text-sm">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiUsers className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${bookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.totalPrice : 0), 0)}
                </p>
                <p className="text-gray-500 text-sm">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'properties'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Properties
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'bookings'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Bookings
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : activeTab === 'properties' ? (
          properties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <FiHome className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No properties yet</p>
              {(user.role === 'host' || user.role === 'admin') && (
                <Link to="/add-property" className="text-primary-600 hover:text-primary-700 font-medium">
                  Add your first property
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map(property => (
                    <tr key={property._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={property.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={property.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-800">{property.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {property.location?.city}, {property.location?.state}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        ${property.price}/night
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {property.isAvailable ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/properties/${property._id}`}
                            className="p-2 text-gray-500 hover:text-primary-600"
                          >
                            <FiEye />
                          </Link>
                          <button
                            onClick={() => toggleAvailability(property)}
                            className="p-2 text-gray-500 hover:text-yellow-600"
                            title={property.isAvailable ? 'Unlist' : 'List'}
                          >
                            {property.isAvailable ? '🙈' : '👁️'}
                          </button>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="p-2 text-gray-500 hover:text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <FiCalendar className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map(booking => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4">
                        <Link
                          to={`/properties/${booking.property?._id}`}
                          className="font-medium text-gray-800 hover:text-primary-600"
                        >
                          {booking.property?.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{booking.guests}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">${booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Dashboard