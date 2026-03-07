import { Link } from 'react-router-dom'
import { Bus, Train, Plane, Clock, MapPin, DollarSign, Users } from 'lucide-react'

const ICONS = { Bus: Bus, Train: Train, Flight: Plane }
const TYPE_COLORS = {
  Bus:    { bg: '#e8f4e8', color: '#1a7f2e' },
  Train:  { bg: '#e8eef8', color: '#1a45a8' },
  Flight: { bg: '#faf0e8', color: '#a85a1a' },
}

export default function TransportCard({ item }) {
  const Icon = ICONS[item.TransportType] || Plane
  const typeStyle = TYPE_COLORS[item.TransportType] || {}

  return (
    <div className="card fade-up" style={styles.card}>
      <div style={styles.header}>
        <div style={{ ...styles.typeBadge, background: typeStyle.bg, color: typeStyle.color }}>
          <Icon size={14} />
          <span>{item.TransportType}</span>
        </div>
        <span style={styles.operator}>{item.Operator}</span>
      </div>

      <div style={styles.route}>
        <div style={styles.routePoint}>
          <MapPin size={15} color="var(--ink-3)" />
          <span style={styles.city}>{item.Route?.split('→')[0]?.trim()}</span>
        </div>
        <div style={styles.routeLine} />
        <div style={styles.routePoint}>
          <MapPin size={15} color="var(--teal)" />
          <span style={styles.city}>{item.Route?.split('→')[1]?.trim()}</span>
        </div>
      </div>

      <div style={styles.meta}>
        <div style={styles.metaItem}>
          <Clock size={14} color="var(--ink-3)" />
          <span>{item.DepartureTime} → {item.ArrivalTime}</span>
        </div>
        <div style={styles.metaItem}>
          <Users size={14} color="var(--ink-3)" />
          <span>{item.SeatsAvailable} seats left</span>
        </div>
      </div>

      <div style={styles.footer}>
        <div>
          <span style={styles.price}>${item.Price}</span>
          <span style={styles.per}>/seat</span>
        </div>
        <Link to={`/transport/${item.TransportID}`} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
          View & Book
        </Link>
      </div>
    </div>
  )
}

const styles = {
  card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 18 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600 },
  operator: { fontSize: 13, color: 'var(--ink-3)' },
  route: { display: 'flex', alignItems: 'center', gap: 12 },
  routePoint: { display: 'flex', alignItems: 'center', gap: 6, flex: 1 },
  city: { fontSize: 16, fontWeight: 600, color: 'var(--ink)' },
  routeLine: { flex: 1, height: 2, background: 'var(--sand-2)', borderRadius: 999, position: 'relative' },
  meta: { display: 'flex', gap: 20 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--sand)' },
  price: { fontSize: 24, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-serif)' },
  per: { fontSize: 13, color: 'var(--ink-3)', marginLeft: 4 },
}
