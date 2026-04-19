import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiArrowRight } from 'react-icons/fi'
import { getProperties } from '../services/api'
import PropertyCard from '../components/PropertyCard'

const Home = () => {
  const navigate = useNavigate()
  const [searchLocation, setSearchLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const { data } = await getProperties({ limit: 8, sort: 'rating' })
      setFeaturedProperties(data.data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchLocation) params.append('location', searchLocation)
    if (checkIn) params.append('checkIn', checkIn)
    if (checkOut) params.append('checkOut', checkOut)
    if (guests) params.append('guests', guests)
    navigate(`/properties?${params.toString()}`)
  }

  const popularDestinations = [
    { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
    { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
    { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    { name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  ]

  const propertyTypes = [
    { type: 'apartment', label: 'Apartments', icon: '🏢' },
    { type: 'house', label: 'Houses', icon: '🏠' },
    { type: 'hotel', label: 'Hotels', icon: '🏨' },
    { type: 'villa', label: 'Villas', icon: '🏡' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-primary-100">
              Discover unique accommodations around the world
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-xl p-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="relative">
                <FiUsers className="absolute left-3 top-3 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full mt-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
              <FiSearch />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularDestinations.map((dest) => (
              <Link
                key={dest.name}
                to={`/properties?location=${dest.name}`}
                className="relative group overflow-hidden rounded-xl aspect-[4/3]"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">{dest.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Property Type */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <Link
                key={type.type}
                to={`/properties?propertyType=${type.type}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <span className="text-4xl mb-2 block">{type.icon}</span>
                <span className="text-gray-800 font-medium">{type.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Top Rated Stays</h2>
            <Link to="/properties" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of hosts on Quick Stay and earn money from your space
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home