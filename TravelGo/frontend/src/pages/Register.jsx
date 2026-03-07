import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { Plane, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}><Plane size={20} color="#fff" /></div>
            <span style={styles.logoText}>TravelGo</span>
          </div>
          <h1 style={styles.title}>Create an account</h1>
          <p style={styles.subtitle}>Join TravelGo and start booking today</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={update('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={update('password')}
                required
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-input"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={update('confirm')}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' },
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
