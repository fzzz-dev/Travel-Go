import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { Plane, Menu, X, LogOut, BookOpen, Search } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <Plane size={18} color="#fff" />
          </div>
          <span style={styles.logoText}>TravelGo</span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          <Link to="/search" style={{ ...styles.link, ...(isActive('/search') ? styles.linkActive : {}) }}>
            Explore
          </Link>
          {user && (
            <Link to="/my-bookings" style={{ ...styles.link, ...(isActive('/my-bookings') ? styles.linkActive : {}) }}>
              My Bookings
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div style={styles.authArea}>
          {user ? (
            <>
              <span style={styles.userName}>Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }} onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: 14 }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/search" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <Search size={16} /> Explore
          </Link>
          {user && (
            <Link to="/my-bookings" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              <BookOpen size={16} /> My Bookings
            </Link>
          )}
          {user ? (
            <button style={{ ...styles.mobileLink, border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={{ ...styles.mobileLink, color: 'var(--gold)', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'var(--white)',
    borderBottom: '1px solid var(--sand-2)',
    boxShadow: 'var(--shadow-sm)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 72, display: 'flex', alignItems: 'center', gap: 32,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.02em' },
  links: { display: 'flex', gap: 28, flex: 1 },
  link: { fontSize: 15, fontWeight: 500, color: 'var(--ink-3)', transition: 'color 200ms', textDecoration: 'none' },
  linkActive: { color: 'var(--ink)', fontWeight: 600 },
  authArea: { display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' },
  userName: { fontSize: 14, color: 'var(--ink-3)' },
  hamburger: { display: 'none', background: 'none', border: 'none', color: 'var(--ink)', padding: 4 },
  mobileMenu: {
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: '12px 24px 16px',
    borderTop: '1px solid var(--sand-2)',
    background: 'var(--white)',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 0', fontSize: 15, color: 'var(--ink)',
    textDecoration: 'none', borderBottom: '1px solid var(--sand)',
    fontWeight: 500,
  },
}
