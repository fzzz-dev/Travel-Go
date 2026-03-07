import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { searchAPI } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { MapPin, Star, Tag, Bed, ArrowLeft, ArrowRight } from 'lucide-react'

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  useEffect(() => {
    searchAPI.hotelById(id)
      .then(({ data }) => setItem(data))
      .catch(() => setError('Hotel not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-state"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
  if (error || !item) return <div style={{ padding: 80, textAlign: 'center' }}><p>{error}</p></div>

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1
  const total = (parseFloat(item.Price) * nights).toFixed(2)

  function handleBook() {
    if (!user) { navigate('/login'); return }
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    navigate(`/booking/Hotel/${id}?${params.toString()}`)
  }

  const CAT_COLORS = {
    Luxury: { bg: '#f8f0e0', color: '#8a6010' },
    Budget: { bg: '#e8f4e8', color: '#1a7f2e' },
    Family: { bg: '#f0e8f8', color: '#6a1a8a' },
  }
  const catStyle = CAT_COLORS[item.Category] || {}

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate(-1)} style={styles.back}>
          <ArrowLeft size={16} /> Back to results
        </button>

        {/* Hero banner */}
        <div style={{ ...styles.heroBanner, background: getGradient(item.Category) }}>
          <span style={styles.heroBannerText}>{item.Name?.charAt(0)}</span>
        </div>

        <div style={styles.grid}>
          <div>
            <div style={styles.card}>
              <div style={styles.topRow}>
                <div style={{ ...styles.catBadge, background: catStyle.bg, color: catStyle.color }}>
                  <Tag size={13} />{item.Category}
                </div>
                <div style={styles.rating}>
                  <Star size={16} fill="var(--gold)" color="var(--gold)" />
                  <span>{item.Rating} / 5</span>
                </div>
              </div>

              <h1 style={styles.title}>{item.Name}</h1>

              <div style={styles.location}>
                <MapPin size={16} color="var(--ink-3)" />
                <span>{item.Location}</span>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionLabel}>Amenities</h3>
                <div style={styles.amenitiesGrid}>
                  {item.Amenities?.split(',').map((a, i) => (
                    <div key={i} style={styles.amenityChip}>{a.trim()}</div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.availability}>
                  <Bed size={16} color="var(--teal)" />
                  <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{item.RoomsAvailable} rooms available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking panel */}
          <div>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Reserve a Room</h3>
              <div style={styles.priceRow}>
                <span style={styles.price}>${item.Price}</span>
                <span style={styles.per}>/night</span>
              </div>

              <div style={styles.dateFields}>
                <div className="form-group">
                  <label className="form-label">Check-in</label>
                  <input type="date" className="form-input" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out</label>
                  <input type="date" className="form-input" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn} />
                </div>
              </div>

              <div style={styles.summaryRows}>
                <div style={styles.summaryRow}><span>Price/night</span><span>${item.Price}</span></div>
                <div style={styles.summaryRow}><span>Nights</span><span>{nights}</span></div>
              </div>

              <div style={styles.totalRow}>
                <span>Total</span>
                <span style={styles.totalAmount}>${total}</span>
              </div>

              <button
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 16 }}
                onClick={handleBook}
              >
                {user ? 'Book Now' : 'Login to Book'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGradient(cat) {
  if (cat === 'Luxury') return 'linear-gradient(135deg, #c9a84c, #8a6010)'
  if (cat === 'Family') return 'linear-gradient(135deg, #9b59b6, #6a1a8a)'
  return 'linear-gradient(135deg, #2ecc71, #1a7f2e)'
}

const styles = {
  back: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer', marginBottom: 24, fontSize: 14 },
  heroBanner: { height: 200, borderRadius: 'var(--radius-lg)', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroBannerText: { fontSize: 80, fontFamily: 'var(--font-serif)', color: 'rgba(255,255,255,.35)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' },
  card: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 20 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600 },
  rating: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15 },
  title: { fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink)', lineHeight: 1.2 },
  location: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: 'var(--ink-3)' },
  section: { paddingTop: 16, borderTop: '1px solid var(--sand)' },
  sectionLabel: { fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 },
  amenitiesGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  amenityChip: { padding: '6px 14px', borderRadius: 999, background: 'var(--sand)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' },
  availability: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 },
  summaryCard: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 },
  summaryTitle: { fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
  price: { fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: 'var(--ink)' },
  per: { fontSize: 14, color: 'var(--ink-3)' },
  dateFields: { display: 'flex', flexDirection: 'column', gap: 12 },
  summaryRows: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12, borderTop: '1px solid var(--sand)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-3)' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, paddingTop: 12, borderTop: '1px solid var(--sand)' },
  totalAmount: { fontFamily: 'var(--font-serif)', fontSize: 28 },
}
