import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('travelgo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('travelgo_token')
      localStorage.removeItem('travelgo_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ─── Search ────────────────────────────────────────────────────
export const searchAPI = {
  transport: (params) => api.get('/search/transport', { params }),
  transportById: (id) => api.get(`/search/transport/${id}`),
  hotels: (params) => api.get('/search/hotels', { params }),
  hotelById: (id) => api.get(`/search/hotels/${id}`),
}

// ─── Bookings ──────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/book', data),
  list: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.delete(`/cancel-booking/${id}`),
}

export default api
