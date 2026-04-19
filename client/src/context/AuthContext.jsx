import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile()
      setUser(data.data)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await api.login({ email, password })
    localStorage.setItem('token', data.token)
    setUser(data.data)
    toast.success('Login successful!')
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.register({ name, email, password })
    localStorage.setItem('token', data.token)
    setUser(data.data)
    toast.success('Registration successful!')
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext