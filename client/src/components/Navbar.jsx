import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiUser, FiHeart, FiLogOut, FiPlus, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiHome className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-800">Quick Stay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/properties" className="text-gray-600 hover:text-primary-600 transition-colors">
              Explore
            </Link>

            {user ? (
              <>
                {user.role === 'host' || user.role === 'admin' ? (
                  <Link to="/add-property" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
                    <FiPlus />
                    <span>List Property</span>
                  </Link>
                ) : null}
                <Link to="/my-bookings" className="text-gray-600 hover:text-primary-600 transition-colors">
                  My Bookings
                </Link>
                <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 transition-colors">
                  <FiHeart className="text-lg" />
                </Link>
                <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-primary-600" />
                    </div>
                  )}
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 transition-colors">
                  <FiLogOut className="text-lg" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/properties" className="text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                Explore
              </Link>
              {user ? (
                <>
                  <Link to="/my-bookings" className="text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                    My Bookings
                  </Link>
                  <Link to="/wishlist" className="text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <Link to="/dashboard" className="text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-gray-600 py-2">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar