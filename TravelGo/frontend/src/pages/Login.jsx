import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { Plane, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}><Plane size={20} color="#fff" /></div>
            <span style={styles.logoText}>TravelGo</span>
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to manage your bookings</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={styles.eyeBtn}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--sand)' },
  card: { width: '100%', maxWidth: 420, background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '40px 36px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 24 },
  header: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  logoIcon: { width: 40, height: 40, borderRadius: 11, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' },
  title: { fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)' },
  subtitle: { fontSize: 14, color: 'var(--ink-3)' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 4 },
  footer: { textAlign: 'center', fontSize: 14, color: 'var(--ink-3)' },
  link: { color: 'var(--teal)', fontWeight: 600 },
}
