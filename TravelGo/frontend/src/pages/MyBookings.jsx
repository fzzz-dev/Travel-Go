import { useState, useEffect } from 'react'
import { bookingAPI } from '../services/api'
import { CheckCircle, XCircle, Clock, Trash2, Plane, Bus, Train, Hotel, AlertTriangle } from 'lucide-react'

const TYPE_ICON = { Transport: Plane, Hotel }

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    bookingAPI.list()
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    setCancelError('')
    try {
      const { data } = await bookingAPI.cancel(id)
      setBookings(prev => prev.map(b => b.BookingID === id ? data.booking : b))
    } catch (e) {
      setCancelError(e.response?.data?.error || 'Cancellation failed.')
    } finally {
      setCancelling(null)
    }
  }

  const filtered = filter === 'All'
    ? bookings
    : bookings.filter(b => b.Status === filter)

  return (
    <div className="page">
      <div className="container">
        <div style={styles.pageHead}>
          <h1 style={styles.pageTitle}>My Bookings</h1>
          <p style={styles.pageSub}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {['All', 'Confirmed', 'Cancelled'].map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {cancelError && (
          <div style={styles.alertError}>
            <AlertTriangle size={16} /> {cancelError}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <span>Loading bookings…</span>
          </div>
        )}

        {error && !loading && <div className="error-msg">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <h3>{filter === 'All' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}</h3>
            <p>Your upcoming trips will appear here.</p>
          </div>
        )}

        <div style={styles.bookingsList}>
          {filtered.map(b => (
            <BookingRow key={b.BookingID} booking={b} onCancel={handleCancel} cancelling={cancelling} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BookingRow({ booking: b, onCancel, cancelling }) {
  const isConfirmed = b.Status === 'Confirmed'
  const isCancelling = cancelling === b.BookingID

  const Icon = b.ItemType === 'Hotel' ? Hotel
    : b.TransportType === 'Bus' ? Bus
    : b.TransportType === 'Train' ? Train
    : Plane

  return (
    <div style={{ ...styles.card, ...(isConfirmed ? {} : styles.cardCancelled) }}>
      <div style={styles.cardLeft}>
        <div style={{ ...styles.iconBox, background: isConfirmed ? 'var(--ink)' : 'var(--sand-2)' }}>
          <Icon size={18} color={isConfirmed ? 'var(--gold)' : 'var(--ink-3)'} />
        </div>
        <div style={styles.cardInfo}>
          <div style={styles.cardTopRow}>
            <h3 style={styles.itemName}>
              {b.Route || b.HotelName || `Booking ${b.BookingID.slice(0, 8).toUpperCase()}`}
            </h3>
            <span style={{ ...styles.statusBadge, ...(isConfirmed ? styles.statusConfirmed : styles.statusCancelled) }}>
              {isConfirmed ? <CheckCircle size={13} /> : <XCircle size={13} />}
              {b.Status}
            </span>
          </div>

          <div style={styles.metaRow}>
            {b.ItemType && <span style={styles.meta}>{b.ItemType}</span>}
            {b.TransportType && <span style={styles.meta}>{b.TransportType}</span>}
            {b.Category && <span style={styles.meta}>{b.Category}</span>}
            {b.Date && <span style={styles.meta}>📅 {b.Date}</span>}
            {b.CheckIn && <span style={styles.meta}>📅 {b.CheckIn} → {b.CheckOut}</span>}
            {b.Location && <span style={styles.meta}>📍 {b.Location}</span>}
            <span style={styles.meta}>🪑 {b.Seats} {b.ItemType === 'Hotel' ? 'room' : 'seat'}{b.Seats > 1 ? 's' : ''}</span>
            {b.Price && <span style={{ ...styles.meta, color: 'var(--teal)', fontWeight: 600 }}>
              ${(parseFloat(b.Price) * b.Seats).toFixed(2)}
            </span>}
          </div>

          <div style={styles.bookingId}>
            <Clock size={12} color="var(--ink-3)" />
            <span>Booked {new Date(b.BookingDate).toLocaleDateString()} · Ref: {b.BookingID.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {isConfirmed && (
        <button
          className="btn btn-danger"
          style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
          onClick={() => onCancel(b.BookingID)}
          disabled={isCancelling}
        >
          {isCancelling ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Trash2 size={13} /> Cancel</>}
        </button>
      )}
    </div>
  )
}

const styles = {
  pageHead: { marginBottom: 24 },
  pageTitle: { fontFamily: 'var(--font-serif)', fontSize: 40, color: 'var(--ink)' },
  pageSub: { fontSize: 15, color: 'var(--ink-3)', marginTop: 4 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 28 },
  filterBtn: { padding: '8px 20px', borderRadius: 999, border: '1.5px solid var(--sand-2)', background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--ink-3)', cursor: 'pointer', transition: 'all 150ms' },
  filterBtnActive: { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' },
  alertError: { display: 'flex', alignItems: 'center', gap: 8, background: '#fde8e8', color: 'var(--rose)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 14 },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, transition: 'box-shadow var(--transition)' },
  cardCancelled: { opacity: 0.65 },
  cardLeft: { display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, minWidth: 0 },
  iconBox: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardTopRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: 700, color: 'var(--ink)' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
  statusConfirmed: { background: '#e8f7f5', color: 'var(--teal)' },
  statusCancelled: { background: '#fde8e8', color: 'var(--rose)' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  meta: { fontSize: 13, color: 'var(--ink-3)' },
  bookingId: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-3)' },
}
