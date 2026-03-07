import { useState } from 'react'

const TOTAL_SEATS = 40
const BOOKED_SEATS = [3, 7, 12, 15, 21, 28, 33] // simulated booked

export default function SeatPicker({ maxSelect = 4, onChange }) {
  const [selected, setSelected] = useState([])

  function toggle(seat) {
    if (BOOKED_SEATS.includes(seat)) return
    setSelected(prev => {
      let next
      if (prev.includes(seat)) {
        next = prev.filter(s => s !== seat)
      } else {
        if (prev.length >= maxSelect) return prev
        next = [...prev, seat]
      }
      onChange?.(next)
      return next
    })
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.legend}>
          <div style={{ ...styles.dot, background: 'var(--sand-2)' }} />
          <span>Available</span>
        </div>
        <div style={styles.legend}>
          <div style={{ ...styles.dot, background: 'var(--ink)' }} />
          <span>Selected</span>
        </div>
        <div style={styles.legend}>
          <div style={{ ...styles.dot, background: 'var(--rose)', opacity: 0.6 }} />
          <span>Booked</span>
        </div>
      </div>

      {/* Driver section */}
      <div style={styles.driver}>
        <span style={styles.driverLabel}>🚌 Driver</span>
      </div>

      {/* Seat grid */}
      <div style={styles.grid}>
        {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map(seat => {
          const isBooked = BOOKED_SEATS.includes(seat)
          const isSelected = selected.includes(seat)
          return (
            <button
              key={seat}
              onClick={() => toggle(seat)}
              disabled={isBooked}
              style={{
                ...styles.seat,
                background: isBooked ? 'var(--rose)' : isSelected ? 'var(--ink)' : 'var(--sand-2)',
                color: isBooked || isSelected ? '#fff' : 'var(--ink)',
                opacity: isBooked ? 0.5 : 1,
                cursor: isBooked ? 'not-allowed' : 'pointer',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {seat}
            </button>
          )
        })}
      </div>

      <p style={styles.status}>
        {selected.length === 0
          ? 'No seats selected'
          : `Selected: ${selected.join(', ')} (${selected.length} seat${selected.length > 1 ? 's' : ''})`
        }
      </p>
    </div>
  )
}

const styles = {
  wrapper: { padding: 20, background: 'var(--sand)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', gap: 20 },
  legend: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)' },
  dot: { width: 14, height: 14, borderRadius: 4 },
  driver: { background: 'var(--ink)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  driverLabel: { color: '#fff', fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 },
  seat: {
    padding: '10px 6px', borderRadius: 8, border: 'none',
    fontSize: 13, fontWeight: 600, transition: 'all 180ms',
  },
  status: { textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--ink)' },
}
