import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PropertyList from './pages/PropertyList'
import PropertyDetail from './pages/PropertyDetail'
import AddProperty from './pages/AddProperty'
import MyBookings from './pages/MyBookings'
import Dashboard from './pages/Dashboard'
import Wishlist from './pages/Wishlist'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App