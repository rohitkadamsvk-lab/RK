import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createProperty, uploadImages } from '../services/api'
import { FiUpload, FiX, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AddProperty = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    price: '',
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    location: {
      city: '',
      state: '',
      country: ''
    }
  })

  const propertyTypes = ['apartment', 'house', 'hotel', 'villa', 'cottage', 'studio']
  const amenityOptions = [
    'wifi', 'parking', 'pool', 'ac', 'heating', 'kitchen',
    'washer', 'dryer', 'tv', 'gym', 'pet-friendly', 'breakfast',
    'workspace', 'hot-tub', 'balcony'
  ]

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('images', file))

      const { data } = await uploadImages(formData)
      setImages([...images, ...data.data])
    } catch (error) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user || (user.role !== 'host' && user.role !== 'admin')) {
      toast.error('Only hosts can list properties')
      return
    }

    setLoading(true)
    try {
      const propertyData = {
        ...formData,
        images,
        price: Number(formData.price),
        maxGuests: Number(formData.maxGuests),
        bedrooms: Number(formData.bedrooms),
        beds: Number(formData.beds),
        bathrooms: Number(formData.bathrooms)
      }

      await createProperty(propertyData)
      toast.success('Property listed successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to list a property</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">List Your Property</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Cozy apartment in downtown"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Describe your property..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    className="input-field"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per night ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="100"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Location</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="New York"
                  value={formData.location.city}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="NY"
                  value={formData.location.state}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="USA"
                  value={formData.location.country}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Amenities</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenityOptions.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-gray-700 capitalize">{amenity.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Photos</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"
                  >
                    <FiX />
                  </button>
                </div>
              ))}

              <label className="aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <FiUpload className="text-gray-400 text-2xl mb-2" />
                <span className="text-sm text-gray-500">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && (
              <div className="flex justify-center py-4">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Creating...' : 'List Property'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddProperty