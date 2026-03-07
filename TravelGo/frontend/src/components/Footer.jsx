import { Link } from 'react-router-dom'
import { Plane } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.inner}>
          <div style={styles.brand}>
            <div style={styles.logoIcon}><Plane size={16} color="#fff" /></div>
            <span style={styles.logoText}>TravelGo</span>
          </div>
          <p style={styles.tagline}>Your unified travel companion — buses, trains, flights & hotels.</p>
          <div style={styles.links}>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/search" style={styles.link}>Search</Link>
            <Link to="/my-bookings" style={styles.link}>Bookings</Link>
          </div>
          <p style={styles.copy}>© {new Date().getFullYear()} TravelGo. Built with AWS ☁️</p>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: { background: 'var(--ink)', color: 'var(--sand)', padding: '40px 0 24px', marginTop: 'auto' },
  inner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 30, height: 30, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--sand)' },
  tagline: { fontSize: 14, color: 'var(--ink-3)', textAlign: 'center' },
  links: { display: 'flex', gap: 24 },
  link: { color: 'var(--ink-3)', fontSize: 14, textDecoration: 'none', transition: 'color 200ms' },
  copy: { fontSize: 13, color: 'var(--ink-3)', marginTop: 8 },
}
