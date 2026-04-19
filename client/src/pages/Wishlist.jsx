import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getWishlist, removeFromWishlist } from '../services/api'
import PropertyCard from '../components/PropertyCard'
import { FiHeart } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      const { data } = await getWishlist(user._id)
      setWishlist(data.data)
    } catch (error) {
      toast.error('Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (propertyId) => {
    try {
      await removeFromWishlist(propertyId)
      toast.success('Removed from wishlist')
      fetchWishlist()
    } catch (error) {
      toast.error('Failed to remove from wishlist')
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your wishlist</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Wishlist</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : !wishlist || wishlist.properties?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FiHeart className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Your wishlist is empty</p>
            <Link to="/properties" className="text-primary-600 hover:text-primary-700 font-medium">
              Explore properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.properties?.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist