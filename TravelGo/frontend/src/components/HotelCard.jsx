import { Link } from 'react-router-dom'
import { MapPin, Star, Bed, Tag } from 'lucide-react'

const CAT_COLORS = {
  Luxury: { bg: '#f8f0e0', color: '#8a6010' },
  Budget: { bg: '#e8f4e8', color: '#1a7f2e' },
  Family: { bg: '#f0e8f8', color: '#6a1a8a' },
}

export default function HotelCard({ item }) {
  const catStyle = CAT_COLORS[item.Category] || {}

  return (
    <div className="card fade-up" style={styles.card}>
      {/* Thumbnail placeholder with gradient */}
      <div style={{ ...styles.thumb, background: getGradient(item.Category) }}>
        <span style={styles.thumbText}>{item.Name?.charAt(0)}</span>
      </div>

      <div style={styles.body}>
        <div style={styles.topRow}>
          <div style={{ ...styles.catBadge, background: catStyle.bg, color: catStyle.color }}>
            <Tag size={12} />{item.Category}
          </div>
          <div style={styles.rating}>
            <Star size={13} fill="var(--gold)" color="var(--gold)" />
            <span>{item.Rating}</span>
          </div>
        </div>

        <h3 style={styles.name}>{item.Name}</h3>

        <div style={styles.location}>
          <MapPin size={14} color="var(--ink-3)" />
          <span>{item.Location}</span>
        </div>

        <p style={styles.amenities}>{item.Amenities}</p>

        <div style={styles.footer}>
          <div>
            <span style={styles.price}>${item.Price}</span>
            <span style={styles.per}>/night</span>
          </div>
          <div style={styles.rooms}>
            <Bed size={14} color="var(--ink-3)" />
            <span>{item.RoomsAvailable} rooms</span>
          </div>
          <Link to={`/hotel/${item.HotelID}`} className="btn btn-teal" style={{ padding: '10px 18px', fontSize: 14 }}>
            View & Book
          </Link>
        </div>
      </div>
    </div>
  )
}

function getGradient(category) {
  if (category === 'Luxury') return 'linear-gradient(135deg, #c9a84c 0%, #8a6010 100%)'
  if (category === 'Family') return 'linear-gradient(135deg, #9b59b6 0%, #6a1a8a 100%)'
  return 'linear-gradient(135deg, #2ecc71 0%, #1a7f2e 100%)'
}

const styles = {
  card: { overflow: 'hidden' },
  thumb: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumbText: { fontSize: 48, fontFamily: 'var(--font-serif)', color: 'rgba(255,255,255,0.5)' },
  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
  rating: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--ink)' },
  name: { fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.2 },
  location: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ink-3)' },
  amenities: { fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--sand)' },
  price: { fontSize: 22, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-serif)' },
  per: { fontSize: 12, color: 'var(--ink-3)', marginLeft: 3 },
  rooms: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ink-3)' },
}
