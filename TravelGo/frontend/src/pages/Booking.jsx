import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { searchAPI, bookingAPI } from '../services/api'
import { CheckCircle, AlertCircle, Plane, Bus, Train, Hotel, ArrowRight } from 'lucide-react'

export default function Booking() {
  const { type, id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  const seats = parseInt(searchParams.get('seats') || '1')
  const selectedSeats = searchParams.get('selectedSeats')?.split(',').map(Number) || []
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')

  useEffect(() => {
    const fetch = type === 'Transport'
      ? searchAPI.transportById(id)
      : searchAPI.hotelById(id)
    fetch
      .then(({ data }) => setItem(data))
      .catch(() => setError('Item not found'))
      .finally(() => setLoading(false))
  }, [type, id])

  async function confirmBooking() {
    setConfirming(true)
    setError('')
    try {
      const payload = {
        itemType: type,
        itemId: id,
        seats,
        selectedSeats,
      }
      if (checkIn) payload.checkIn = checkIn
      if (checkOut) payload.checkOut = checkOut
      const { data } = await bookingAPI.create(payload)
      setBooking(data.booking)
    } catch (e) {
      setError(e.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <div className="loading-state"><div className="spinner" style={{ width: 36, height: 36 }} /></div>

  // Success state
  if (booking) {
    return (
      <div className="page">
        <div className="container">
          <div style={styles.successCard}>
            <div style={styles.checkCircle}>
              <CheckCircle size={48} color="var(--teal)" />
            </div>
            <h1 style={styles.successTitle}>Booking Confirmed! 🎉</h1>
            <p style={styles.successSub}>
              Your booking reference is <strong>{booking.BookingID.slice(0, 8).toUpperCase()}</strong>
            </p>
            <p style={styles.noticeText}>📧 A confirmation notification has been sent via AWS SNS.</p>

            <div style={styles.detailsGrid}>
              {[
                ['Booking ID', booking.BookingID.slice(0, 8).toUpperCase()],
                ['Type', booking.ItemType],
                ['Status', booking.Status],
                ['Date', new Date(booking.BookingDate).toLocaleDateString()],
                ...(booking.Route ? [['Route', booking.Route]] : []),
                ...(booking.HotelName ? [['Hotel', booking.HotelName]] : []),
                ...(booking.Date ? [['Travel Date', booking.Date]] : []),
                ...(booking.CheckIn ? [['Check-in', booking.CheckIn]] : []),
                ['Seats / Rooms', booking.Seats],
                ['Total Price', `$${(parseFloat(booking.Price || 0) * (booking.Seats || 1)).toFixed(2)}`],
              ].map(([label, val]) => (
                <div key={label} style={styles.detailItem}>
                  <span style={styles.detailLabel}>{label}</span>
                  <span style={styles.detailVal}>{val}</span>
                </div>
              ))}
            </div>

            <div style={styles.actionBtns}>
              <Link to="/my-bookings" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                View My Bookings <ArrowRight size={16} />
              </Link>
              <Link to="/search" className="btn btn-outline" style={{ padding: '12px 28px' }}>
                Search More
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Confirm page
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1
  const price = parseFloat(item?.Price || 0)
  const total = type === 'Hotel' ? (price * nights).toFixed(2) : (price * seats).toFixed(2)

  const Icon = item?.TransportType === 'Bus' ? Bus : item?.TransportType === 'Train' ? Train : item?.TransportType === 'Flight' ? Plane : Hotel

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={styles.pageTitle}>Confirm Booking</h1>
        <p style={styles.pageSub}>Review your booking details before confirming</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={styles.confirmCard}>
          <div style={styles.confirmHeader}>
            <div style={styles.confirmIcon}><Icon size={22} color="var(--gold)" /></div>
            <div>
              <h2 style={styles.confirmName}>
                {item?.Route || item?.Name}
              </h2>
              <p style={styles.confirmSub}>
                {item?.TransportType || item?.Category} · {item?.Operator || item?.Location}
              </p>
            </div>
          </div>

          <div style={styles.detailsList}>
            {type === 'Transport' ? (
              <>
                <div style={styles.detailRow}><span>Route</span><strong>{item?.Route}</strong></div>
                <div style={styles.detailRow}><span>Date</span><strong>{item?.Date}</strong></div>
                <div style={styles.detailRow}><span>Departure</span><strong>{item?.DepartureTime}</strong></div>
                <div style={styles.detailRow}><span>Arrival</span><strong>{item?.ArrivalTime}</strong></div>
                <div style={styles.detailRow}><span>Seats</span><strong>{selectedSeats.length || seats}</strong></div>
                {selectedSeats.length > 0 && (
                  <div style={styles.detailRow}><span>Seat Numbers</span><strong>{selectedSeats.join(', ')}</strong></div>
                )}
              </>
            ) : (
              <>
                <div style={styles.detailRow}><span>Hotel</span><strong>{item?.Name}</strong></div>
                <div style={styles.detailRow}><span>Location</span><strong>{item?.Location}</strong></div>
                <div style={styles.detailRow}><span>Category</span><strong>{item?.Category}</strong></div>
                {checkIn && <div style={styles.detailRow}><span>Check-in</span><strong>{checkIn}</strong></div>}
                {checkOut && <div style={styles.detailRow}><span>Check-out</span><strong>{checkOut}</strong></div>}
                <div style={styles.detailRow}><span>Nights</span><strong>{nights}</strong></div>
              </>
            )}
            <div style={styles.detailRow}><span>Price per {type === 'Hotel' ? 'night' : 'seat'}</span><strong>${item?.Price}</strong></div>
          </div>

          <div style={styles.totalSection}>
            <span style={styles.totalLabel}>Total Amount</span>
            <span style={styles.totalAmount}>${total}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="btn btn-gold"
              style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 16 }}
              onClick={confirmBooking}
              disabled={confirming}
            >
              {confirming ? <><span className="spinner" /> Confirming…</> : `Confirm & Pay $${total}`}
            </button>
            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', padding: 14 }}
              onClick={() => navigate(-1)}
              disabled={confirming}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  pageTitle: { fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink)', marginBottom: 8 },
  pageSub: { fontSize: 15, color: 'var(--ink-3)', marginBottom: 28 },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fde8e8', color: 'var(--rose)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 14 },
  confirmCard: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 24 },
  confirmHeader: { display: 'flex', gap: 16, alignItems: 'center' },
  confirmIcon: { width: 52, height: 52, borderRadius: 14, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  confirmName: { fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' },
  confirmSub: { fontSize: 13, color: 'var(--ink-3)', marginTop: 4 },
  detailsList: { display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 10, borderBottom: '1px solid var(--sand)' },
  totalSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '2px solid var(--sand-2)' },
  totalLabel: { fontSize: 15, fontWeight: 700, color: 'var(--ink)' },
  totalAmount: { fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink)', fontWeight: 700 },
  successCard: { maxWidth: 560, margin: '0 auto', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 48, boxShadow: 'var(--shadow-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 },
  checkCircle: { width: 80, height: 80, borderRadius: '50%', background: '#e8f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink)' },
  successSub: { fontSize: 16, color: 'var(--ink-3)' },
  noticeText: { fontSize: 14, color: 'var(--teal)', background: '#e8f7f5', padding: '10px 20px', borderRadius: 'var(--radius)', fontWeight: 500 },
  detailsGrid: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', padding: '16px 0', borderTop: '1px solid var(--sand)', borderBottom: '1px solid var(--sand)' },
  detailItem: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  detailLabel: { color: 'var(--ink-3)' },
  detailVal: { fontWeight: 600, color: 'var(--ink)' },
  actionBtns: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
}
