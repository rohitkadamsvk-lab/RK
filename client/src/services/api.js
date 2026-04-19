import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)
export const getProfile = () => API.get('/auth/profile')
export const updateProfile = (data) => API.put('/auth/profile', data)

// Property APIs
export const getProperties = (params) => API.get('/properties', { params })
export const getProperty = (id) => API.get(`/properties/${id}`)
export const getUserProperties = (userId) => API.get(`/properties/user/${userId}`)
export const createProperty = (data) => API.post('/properties', data)
export const updateProperty = (id, data) => API.put(`/properties/${id}`, data)
export const deleteProperty = (id) => API.delete(`/properties/${id}`)
export const uploadImages = (formData) => API.post('/properties/upload-images', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Booking APIs
export const createBooking = (data) => API.post('/bookings', data)
export const getUserBookings = (userId) => API.get(`/bookings/user/${userId}`)
export const getPropertyBookings = (propertyId) => API.get(`/bookings/property/${propertyId}`)
export const getBooking = (id) => API.get(`/bookings/${id}`)
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`)

// Review APIs
export const createReview = (data) => API.post('/reviews', data)
export const getPropertyReviews = (propertyId) => API.get(`/reviews/property/${propertyId}`)
export const deleteReview = (id) => API.delete(`/reviews/${id}`)

// Wishlist APIs
export const getWishlist = (userId) => API.get(`/wishlist/${userId}`)
export const addToWishlist = (propertyId) => API.post('/wishlist', { propertyId })
export const removeFromWishlist = (propertyId) => API.delete(`/wishlist/${propertyId}`)
export const checkWishlist = (propertyId) => API.get(`/wishlist/check/${propertyId}`)

export default API