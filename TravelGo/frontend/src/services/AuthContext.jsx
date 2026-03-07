import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('travelgo_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  function persistUser(userData, token) {
    localStorage.setItem('travelgo_token', token)
    localStorage.setItem('travelgo_user', JSON.stringify(userData))
    setUser(userData)
  }

  async function login(email, password) {
    const { data } = await authAPI.login({ email, password })
    persistUser(data.user, data.token)
    return data.user
  }

  async function register(name, email, password) {
    const { data } = await authAPI.register({ name, email, password })
    persistUser(data.user, data.token)
    return data.user
  }

  function logout() {
    localStorage.removeItem('travelgo_token')
    localStorage.removeItem('travelgo_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
