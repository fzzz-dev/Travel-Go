import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { searchAPI } from '../services/api'
import { useAuth } from '../services/AuthContext'
import SeatPicker from '../components/SeatPicker'
import { Bus, Train, Plane, MapPin, Clock, Users, ArrowLeft, ArrowRight } from 'lucide-react'

const ICONS = { Bus, Train, Flight: Plane }

export default function TransportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [seats, setSeats] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    searchAPI.transportById(id)
      .then(({ data }) => setItem(data))
      .catch(() => setError('Transport listing not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-state"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
  if (error || !item) return <div style={{ padding: 80, textAlign: 'center' }}><p>{error}</p><Link to="/search">← Back to search</Link></div>

  const Icon = ICONS[item.TransportType] || Plane
  const isBus = item.TransportType === 'Bus'
  const total = (parseFloat(item.Price) * (isBus ? selectedSeats.length || seats : seats)).toFixed(2)

  function handleBook() {
    if (!user) {
      navigate(`/login`)
      return
    }
    const params = new URLSearchParams({ seats: isBus ? (selectedSeats.length || 1) : seats })
    if (isBus && selectedSeats.length) params.set('selectedSeats', selectedSeats.join(','))
    navigate(`/booking/Transport/${id}?${params.toString()}`)
  }

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate(-1)} style={styles.back}>
          <ArrowLeft size={16} /> Back to results
        </button>

        <div style={styles.grid}>
          {/* Detail card */}
          <div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.iconCircle}><Icon size={24} color="var(--gold)" /></div>
                <div>
                  <h1 style={styles.title}>{item.Route}</h1>
                  <p style={styles.operator}>{item.Operator} · {item.TransportType}</p>
                </div>
              </div>

              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <Clock size={16} color="var(--ink-3)" />
                  <div>
                    <p style={styles.statLabel}>Departure</p>
                    <p style={styles.statValue}>{item.DepartureTime}</p>
                  </div>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <Clock size={16} color="var(--teal)" />
                  <div>
                    <p style={styles.statLabel}>Arrival</p>
                    <p style={styles.statValue}>{item.ArrivalTime}</p>
                  </div>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <Users size={16} color="var(--ink-3)" />
                  <div>
                    <p style={styles.statLabel}>Available</p>
                    <p style={styles.statValue}>{item.SeatsAvailable} seats</p>
                  </div>
                </div>
              </div>

              <div style={styles.dateRow}>
                <MapPin size={14} color="var(--ink-3)" />
                <span>Date: <strong>{item.Date}</strong></span>
              </div>

              {/* Bus seat picker */}
              {isBus && (
                <div>
                  <p style={styles.sectionLabel}>Select your seats</p>
                  <SeatPicker maxSelect={6} onChange={setSelectedSeats} />
                </div>
              )}

              {/* Non-bus seat count */}
              {!isBus && (
                <div className="form-group" style={{ maxWidth: 200 }}>
                  <label className="form-label">Number of seats</label>
                  <input
                    type="number"
                    className="form-input"
                    value={seats}
                    onChange={e => setSeats(Math.max(1, Math.min(parseInt(e.target.value) || 1, item.SeatsAvailable)))}
                    min="1"
                    max={item.SeatsAvailable}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Booking summary */}
          <div>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Booking Summary</h3>
              <div style={styles.summaryRows}>
                <div style={styles.summaryRow}>
                  <span>Route</span><span style={{ fontWeight: 600 }}>{item.Route}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Date</span><span>{item.Date}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Price per seat</span><span>${item.Price}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Seats</span>
                  <span>{isBus ? (selectedSeats.length || 0) : seats}</span>
                </div>
                {isBus && selectedSeats.length > 0 && (
                  <div style={styles.summaryRow}>
                    <span>Seat numbers</span><span>{selectedSeats.join(', ')}</span>
                  </div>
                )}
              </div>
              <div style={styles.totalRow}>
                <span>Total</span>
                <span style={styles.totalAmount}>${total}</span>
              </div>
              <button
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 16 }}
                onClick={handleBook}
                disabled={isBus && selectedSeats.length === 0}
              >
                {user ? 'Proceed to Book' : 'Login to Book'} <ArrowRight size={16} />
              </button>
              {!user && <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8 }}>You need to be logged in to book</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  back: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer', marginBottom: 28, fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' },
  card: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 28 },
  cardHeader: { display: 'flex', gap: 16, alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 16, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--ink)', lineHeight: 1.2 },
  operator: { fontSize: 14, color: 'var(--ink-3)', marginTop: 4 },
  statsRow: { display: 'flex', gap: 20, padding: '20px 0', borderTop: '1px solid var(--sand)', borderBottom: '1px solid var(--sand)' },
  stat: { display: 'flex', gap: 10, alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' },
  statValue: { fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginTop: 2 },
  statDivider: { width: 1, background: 'var(--sand-2)' },
  dateRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--ink-3)' },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' },
  summaryCard: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 88 },
  summaryTitle: { fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)', marginBottom: 20 },
  summaryRows: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--sand)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-3)' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 },
  totalAmount: { fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)' },
}
