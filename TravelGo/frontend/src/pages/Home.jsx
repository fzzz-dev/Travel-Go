import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Train, Bus, Hotel, ArrowRight, MapPin, Calendar, Search } from 'lucide-react'

const TRAVEL_TYPES = [
  { id: 'Bus',    label: 'Bus',    icon: Bus,   desc: 'Comfortable intercity buses' },
  { id: 'Train',  label: 'Train',  icon: Train, desc: 'Fast rail connections' },
  { id: 'Flight', label: 'Flight', icon: Plane, desc: 'Domestic & international flights' },
  { id: 'Hotel',  label: 'Hotel',  icon: Hotel, desc: 'Hotels for every budget' },
]

const POPULAR = [
  { from: 'New York', to: 'Boston',       type: 'Bus',    price: '$25' },
  { from: 'JFK',      to: 'LAX',          type: 'Flight', price: '$210' },
  { from: 'Chicago',  to: 'Detroit',      type: 'Train',  price: '$55' },
  { from: 'Miami',    to: null,           type: 'Hotel',  price: 'From $79' },
]

export default function Home() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState('Flight')
  const [route, setRoute] = useState('')
  const [date, setDate] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (activeType !== 'Hotel') {
      params.set('type', activeType)
      params.set('tab', 'transport')
    } else {
      params.set('tab', 'hotels')
    }
    if (route) params.set('route', route)
    if (date) params.set('date', date)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>Your unified travel platform</p>
            <h1 style={styles.heroTitle}>
              Journey without<br />
              <em>limits.</em>
            </h1>
            <p style={styles.heroSub}>
              Search buses, trains, flights and hotels — all in one place.
            </p>

            {/* Search box */}
            <div style={styles.searchBox}>
              {/* Tab switcher */}
              <div style={styles.tabs}>
                {TRAVEL_TYPES.map(t => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveType(t.id)}
                      style={{
                        ...styles.tab,
                        ...(activeType === t.id ? styles.tabActive : {}),
                      }}
                    >
                      <Icon size={15} />
                      {t.label}
                    </button>
                  )
                })}
              </div>

              {/* Inputs */}
              <form style={styles.searchForm} onSubmit={handleSearch}>
                {activeType !== 'Hotel' ? (
                  <div style={styles.inputGroup}>
                    <MapPin size={16} color="var(--ink-3)" style={styles.inputIcon} />
                    <input
                      className="form-input"
                      placeholder="Route (e.g. New York → Boston)"
                      value={route}
                      onChange={e => setRoute(e.target.value)}
                      style={{ paddingLeft: 40, border: 'none', background: 'transparent', flex: 1 }}
                    />
                  </div>
                ) : (
                  <div style={styles.inputGroup}>
                    <MapPin size={16} color="var(--ink-3)" style={styles.inputIcon} />
                    <input
                      className="form-input"
                      placeholder="City or destination"
                      value={route}
                      onChange={e => setRoute(e.target.value)}
                      style={{ paddingLeft: 40, border: 'none', background: 'transparent', flex: 1 }}
                    />
                  </div>
                )}
                <div style={styles.divider} />
                <div style={styles.inputGroup}>
                  <Calendar size={16} color="var(--ink-3)" style={styles.inputIcon} />
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{ paddingLeft: 40, border: 'none', background: 'transparent', width: 160 }}
                  />
                </div>
                <button type="submit" className="btn btn-gold" style={{ borderRadius: 10, padding: '14px 24px', gap: 8 }}>
                  <Search size={16} /> Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Popular Routes</h2>
            <button onClick={() => navigate('/search')} style={styles.seeAll}>
              See all <ArrowRight size={14} />
            </button>
          </div>
          <div style={styles.popularGrid}>
            {POPULAR.map((p, i) => {
              const Icon = TRAVEL_TYPES.find(t => t.id === p.type)?.icon || Plane
              return (
                <div
                  key={i}
                  className="card"
                  style={styles.popularCard}
                  onClick={() => navigate('/search?tab=' + (p.type === 'Hotel' ? 'hotels' : 'transport') + '&type=' + p.type)}
                >
                  <div style={styles.popularIcon}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p style={styles.popularRoute}>
                      {p.from}{p.to ? ` → ${p.to}` : ''}
                    </p>
                    <p style={styles.popularType}>{p.type}</p>
                  </div>
                  <span style={styles.popularPrice}>{p.price}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why TravelGo */}
      <section style={{ ...styles.section, background: 'var(--ink)', margin: '0', padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ ...styles.sectionTitle, color: 'var(--sand)', textAlign: 'center', marginBottom: 48 }}>
            Why TravelGo?
          </h2>
          <div style={styles.featuresGrid}>
            {[
              { icon: '⚡', title: 'Instant Booking', desc: 'Book in seconds with real-time seat availability.' },
              { icon: '🔔', title: 'Smart Notifications', desc: 'AWS SNS alerts for every booking and cancellation.' },
              { icon: '☁️', title: 'Cloud-Powered', desc: 'Built on AWS DynamoDB for fast, reliable data access.' },
              { icon: '🔒', title: 'Secure Auth', desc: 'JWT-based authentication protecting your bookings.' },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const styles = {
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0f1117 0%, #1a2535 40%, #1a3a3a 100%)',
    padding: '100px 0 120px',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,168,76,.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(26,127,116,.15) 0%, transparent 50%)',
  },
  heroContent: { maxWidth: 700 },
  heroEyebrow: { fontSize: 13, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 },
  heroTitle: { fontFamily: 'var(--font-serif)', fontSize: 'clamp(52px, 7vw, 80px)', lineHeight: 1.1, color: '#fff', marginBottom: 20 },
  heroSub: { fontSize: 18, color: 'rgba(255,255,255,.65)', marginBottom: 48, lineHeight: 1.7 },
  searchBox: {
    background: 'rgba(255,255,255,.97)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
    maxWidth: 760,
  },
  tabs: { display: 'flex', borderBottom: '1px solid var(--sand-2)' },
  tab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '14px 8px', border: 'none', background: 'none', fontSize: 14, fontWeight: 500,
    color: 'var(--ink-3)', cursor: 'pointer', transition: 'all 180ms',
  },
  tabActive: { color: 'var(--ink)', fontWeight: 600, borderBottom: '2px solid var(--ink)' },
  searchForm: { display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 4 },
  inputGroup: { flex: 1, display: 'flex', alignItems: 'center', position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, pointerEvents: 'none', zIndex: 1 },
  divider: { width: 1, height: 28, background: 'var(--sand-2)', margin: '0 4px' },

  section: { padding: '72px 0' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 },
  sectionTitle: { fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink)' },
  seeAll: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', fontSize: 14, color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' },

  popularGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  popularCard: { display: 'flex', alignItems: 'center', gap: 14, padding: 20, cursor: 'pointer' },
  popularIcon: { width: 44, height: 44, background: 'var(--sand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  popularRoute: { fontWeight: 600, fontSize: 14, color: 'var(--ink)' },
  popularType: { fontSize: 12, color: 'var(--ink-3)', marginTop: 2 },
  popularPrice: { marginLeft: 'auto', fontWeight: 700, color: 'var(--teal)', fontSize: 15 },

  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 },
  featureCard: { background: 'rgba(255,255,255,.06)', borderRadius: 'var(--radius)', padding: '28px 24px', textAlign: 'center' },
  featureIcon: { fontSize: 36, display: 'block', marginBottom: 16 },
  featureTitle: { fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--sand)', marginBottom: 10 },
  featureDesc: { fontSize: 14, color: 'rgba(245,240,232,.55)', lineHeight: 1.65 },
}
