import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { getProperties } from '../services/api'
import PropertyCard from '../components/PropertyCard'
import { FiFilter, FiMap, FiGrid, FiX } from 'react-icons/fi'

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
    guests: searchParams.get('guests') || '',
  })

  useEffect(() => {
    fetchProperties()
  }, [searchParams])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(searchParams)
      const { data } = await getProperties(params)
      setProperties(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    setSearchParams(params)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      sort: '',
      guests: '',
    })
    setSearchParams({})
  }

  const propertyTypes = ['apartment', 'house', 'hotel', 'villa', 'cottage', 'studio']
  const sortOptions = [
    { value: '', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters Bar */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 overflow-x-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <FiFilter />
                <span>Filters</span>
              </button>

              <select
                className="px-3 py-2 border rounded-lg text-gray-600"
                value={filters.sort}
                onChange={(e) => {
                  setFilters({ ...filters, sort: e.target.value })
                  const params = new URLSearchParams(searchParams)
                  if (e.target.value) params.set('sort', e.target.value)
                  else params.delete('sort')
                  setSearchParams(params)
                }}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {(filters.location || filters.propertyType || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                >
                  <FiX />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMap(false)}
                className={`p-2 rounded-lg ${!showMap ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`p-2 rounded-lg ${showMap ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              >
                <FiMap />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  className="input-field"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  className="input-field"
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={applyFilters} className="btn-primary w-full">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-gray-600 mb-4">{pagination.total} properties found</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties found</p>
            <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 mt-2">
              Clear filters
            </button>
          </div>
        ) : showMap ? (
          <div className="h-[600px] rounded-xl overflow-hidden">
            <MapContainer
              center={[40.7128, -74.0060]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {properties.map(property => (
                property.location?.coordinates?.lat && (
                  <Marker
                    key={property._id}
                    position={[property.location.coordinates.lat, property.location.coordinates.lng]}
                  >
                    <Popup>
                      <div className="w-48">
                        <img
                          src={property.images?.[0] || 'https://via.placeholder.com/200'}
                          alt={property.title}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                        <h3 className="font-semibold text-sm">{property.title}</h3>
                        <p className="text-primary-600 font-bold">${property.price}/night</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => {
                  const params = new URLSearchParams(searchParams)
                  params.set('page', page)
                  setSearchParams(params)
                }}
                className={`w-10 h-10 rounded-lg ${
                  pagination.page === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyList