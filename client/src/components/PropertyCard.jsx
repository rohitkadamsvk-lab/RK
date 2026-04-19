import { Link } from 'react-router-dom'
import { FiStar, FiHeart } from 'react-icons/fi'
import { useState } from 'react'
import { addToWishlist, removeFromWishlist } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PropertyCard = ({ property }) => {
  const { user } = useAuth()
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to add to wishlist')
      return
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(property._id)
        toast.success('Removed from wishlist')
      } else {
        await addToWishlist(property._id)
        toast.success('Added to wishlist')
      }
      setIsWishlisted(!isWishlisted)
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'

  return (
    <Link to={`/properties/${property._id}`} className="property-card group">
      <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Image */}
        <div className="aspect-[4/3] relative">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <FiHeart className={`text-lg ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          {property.propertyType && (
            <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-md text-xs font-medium text-gray-700 capitalize">
              {property.propertyType}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800 line-clamp-1">
              {property.title}
            </h3>
            {property.rating > 0 && (
              <div className="flex items-center space-x-1 text-sm">
                <FiStar className="text-yellow-500 fill-current" />
                <span className="font-medium">{property.rating.toFixed(1)}</span>
                <span className="text-gray-500">({property.reviewCount})</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-sm mb-2">
            {property.location?.city}, {property.location?.state}
          </p>

          <div className="flex items-center text-gray-500 text-sm space-x-3 mb-3">
            <span>{property.bedrooms} beds</span>
            <span>{property.bathrooms} baths</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-800">${property.price}</span>
              <span className="text-gray-500 text-sm"> / night</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PropertyCard