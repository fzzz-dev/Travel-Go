import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchAPI } from '../services/api'
import TransportCard from '../components/TransportCard'
import HotelCard from '../components/HotelCard'
import { Search, SlidersHorizontal, Bus, Train, Plane, Hotel } from 'lucide-react'

const TRANSPORT_TYPES = ['Bus', 'Train', 'Flight']

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'transport')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Transport filters
  const [transportType, setTransportType] = useState(searchParams.get('type') || '')
  const [route, setRoute] = useState(searchParams.get('route') || '')
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [maxPrice, setMaxPrice] = useState('')

  // Hotel filters
  const [location, setLocation] = useState(searchParams.get('route') || '')
  const [category, setCategory] = useState('')
  const [hotelMaxPrice, setHotelMaxPrice] = useState('')

  const fetchTransport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (transportType) params.type = transportType
      if (route) params.route = route
      if (date) params.date = date
      if (maxPrice) params.max_price = maxPrice
      const { data } = await searchAPI.transport(params)
      setResults(data.results)
    } catch (e) {
      setError('Failed to load transport results.')
    } finally {
      setLoading(false)
    }
  }, [transportType, route, date, maxPrice])

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (location) params.location = location
      if (category) params.category = category
      if (hotelMaxPrice) params.max_price = hotelMaxPrice
      const { data } = await searchAPI.hotels(params)
      setResults(data.results)
    } catch (e) {
      setError('Failed to load hotel results.')
    } finally {
      setLoading(false)
    }
  }, [location, category, hotelMaxPrice])

  useEffect(() => {
    if (tab === 'transport') fetchTransport()
    else fetchHotels()
  }, [tab])

  function handleSearch(e) {
    e.preventDefault()
    if (tab === 'transport') fetchTransport()
    else fetchHotels()
  }

  return (
    <div className="page">
      <div className="container">
        <div style={styles.pageHead}>
          <h1 style={styles.pageTitle}>Find Your Journey</h1>
          <p style={styles.pageSubtitle}>Search across all travel options</p>
        </div>

        {/* Tab selector */}
        <div style={styles.tabBar}>
          <button
            style={{ ...styles.tabBtn, ...(tab === 'transport' ? styles.tabBtnActive : {}) }}
            onClick={() => { setTab('transport'); setResults([]) }}
          >
            <Plane size={15} /> Transport
          </button>
          <button
            style={{ ...styles.tabBtn, ...(tab === 'hotels' ? styles.tabBtnActive : {}) }}
            onClick={() => { setTab('hotels'); setResults([]) }}
          >
            <Hotel size={15} /> Hotels
          </button>
        </div>

        <div style={styles.layout}>
          {/* Sidebar filters */}
          <aside style={styles.sidebar}>
            <div style={styles.filterBox}>
              <div style={styles.filterHead}>
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </div>
              <form onSubmit={handleSearch} style={styles.filterForm}>
                {tab === 'transport' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-input" value={transportType} onChange={e => setTransportType(e.target.value)}>
                        <option value="">All Types</option>
                        {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Route</label>
                      <input className="form-input" placeholder="e.g. New York" value={route} onChange={e => setRoute(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Price ($)</label>
                      <input type="number" className="form-input" placeholder="e.g. 200" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" />
                    </div>
                    <div style={styles.typeButtons}>
                      {TRANSPORT_TYPES.map(t => {
                        const Icon = t === 'Bus' ? Bus : t === 'Train' ? Train : Plane
                        return (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setTransportType(transportType === t ? '' : t)}
                            style={{ ...styles.typeBtn, ...(transportType === t ? styles.typeBtnActive : {}) }}
                          >
                            <Icon size={14} /> {t}
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" placeholder="e.g. New York" value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Budget">Budget</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Price/night ($)</label>
                      <input type="number" className="form-input" placeholder="e.g. 300" value={hotelMaxPrice} onChange={e => setHotelMaxPrice(e.target.value)} min="0" />
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                  <Search size={15} /> Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransportType(''); setRoute(''); setDate(''); setMaxPrice('')
                    setLocation(''); setCategory(''); setHotelMaxPrice('')
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer', textAlign: 'center' }}
                >
                  Clear filters
                </button>
              </form>
            </div>
          </aside>

          {/* Results */}
          <main style={styles.results}>
            {loading && (
              <div className="loading-state">
                <div className="spinner" style={{ width: 32, height: 32 }} />
                <span>Searching…</span>
              </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            {!loading && !error && results.length === 0 && (
              <div className="empty-state">
                <h3>No results found</h3>
                <p>Try adjusting your filters or search for a different route.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <p style={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                <div style={styles.grid}>
                  {results.map(item => (
                    tab === 'transport'
                      ? <TransportCard key={item.TransportID} item={item} />
                      : <HotelCard key={item.HotelID} item={item} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

const styles = {
  pageHead: { marginBottom: 32 },
  pageTitle: { fontFamily: 'var(--font-serif)', fontSize: 40, color: 'var(--ink)', marginBottom: 6 },
  pageSubtitle: { fontSize: 16, color: 'var(--ink-3)' },
  tabBar: { display: 'flex', gap: 8, marginBottom: 32, background: 'var(--white)', padding: 6, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', width: 'fit-content' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: 'var(--ink-3)', cursor: 'pointer', transition: 'all 200ms' },
  tabBtnActive: { background: 'var(--ink)', color: '#fff' },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28 },
  sidebar: { position: 'sticky', top: 88, height: 'fit-content' },
  filterBox: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' },
  filterHead: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--sand)' },
  filterForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  typeButtons: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  typeBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, border: '1.5px solid var(--sand-2)', background: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'all 150ms' },
  typeBtnActive: { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' },
  results: { minHeight: 400 },
  resultCount: { fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
}
