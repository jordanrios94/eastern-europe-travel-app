import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import InstagramGrid from './InstagramGrid';
import './DayModal.css';

// Custom activity marker icon
function makeActivityIcon(color, isActive) {
  return L.divIcon({
    className: '',
    html: `<div class="activity-marker${isActive ? ' activity-marker--active' : ''}" style="background:${color};box-shadow:0 0 0 3px ${color}55"></div>`,
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
    popupAnchor:[0, -12],
  });
}

// Fly to selected activity on the city map
function FlyToActivity({ activity }) {
  const map = useMap();
  useEffect(() => {
    if (!activity) return;
    map.flyTo(
      [activity.coordinates.lat, activity.coordinates.lng],
      14,
      { animate: true, duration: 0.9 }
    );
  }, [activity, map]);
  return null;
}

function DayModal({ day, onClose }) {
  const [activeIdx, setActiveIdx]   = useState(null);
  const [activeTab, setActiveTab]   = useState('details');
  const markerRefs                  = useRef([]);
  const accordionRef                = useRef(null);

  // Compute initial map centre (average of all activity coords)
  const center = day.activities.reduce(
    (acc, act) => [acc[0] + act.coordinates.lat, acc[1] + act.coordinates.lng],
    [0, 0]
  ).map((v) => v / day.activities.length);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAccordionToggle = (idx) => {
    const next = activeIdx === idx ? null : idx;
    setActiveIdx(next);
    // Open the map marker popup after fly-to finishes
    if (next !== null) {
      setTimeout(() => markerRefs.current[next]?.openPopup(), 950);
    }
  };

  const activeActivity = activeIdx !== null ? day.activities[activeIdx] : null;

  return (
    <div
      className="dm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Day ${day.dayNumber}: ${day.city} details`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="dm-panel">
        {/* ── Modal header ───────────────────────────────────── */}
        <header className="dm-header" style={{ '--accent': day.countryColor }}>
          <div className="dm-header-bar" />
          <div className="dm-header-inner">
            <div className="dm-header-meta">
              <span className="dm-day-badge">Day {day.dayNumber}</span>
              <span className="dm-header-date">{day.date}</span>
            </div>
            <h2 className="dm-header-city">
              <span>{day.flag}</span>
              {day.city}
            </h2>
            <p className="dm-header-country" style={{ color: day.countryColor }}>
              {day.country}
            </p>
          </div>
          <button
            className="dm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        {/* ── Tab bar ────────────────────────────────────────── */}
        <div className="dm-tabs" style={{ '--accent': day.countryColor }}>
          <button
            className={`dm-tab${activeTab === 'details' ? ' dm-tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
            aria-selected={activeTab === 'details'}
            role="tab"
          >
            <span className="dm-tab-icon" aria-hidden="true">🗺</span>
            Details &amp; Map
          </button>
          <button
            className={`dm-tab${activeTab === 'instagram' ? ' dm-tab--active' : ''}`}
            onClick={() => setActiveTab('instagram')}
            aria-selected={activeTab === 'instagram'}
            role="tab"
          >
            <span className="dm-tab-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </span>
            Instagram
          </button>
        </div>

        {/* ── Modal body ──────────────────────────────────────── */}
        <div className="dm-body">
          {activeTab === 'details' ? (
            <>
              {/* Left: accordion */}
              <div className="dm-accordion-col" ref={accordionRef}>
                <p className="dm-accordion-label">Activities</p>
                <ul className="dm-accordion-list" role="list">
                  {day.activities.map((act, i) => {
                    const isOpen = activeIdx === i;
                    return (
                      <li key={i} className={`dm-accordion-item${isOpen ? ' dm-accordion-item--open' : ''}`}>
                        <button
                          className="dm-accordion-trigger"
                          style={{ '--accent': day.countryColor }}
                          onClick={() => handleAccordionToggle(i)}
                          aria-expanded={isOpen}
                        >
                          <span
                            className="dm-accordion-num"
                            style={{ background: day.countryColor }}
                          >
                            {i + 1}
                          </span>
                          <span className="dm-accordion-title">{act.title}</span>
                          <span className="dm-accordion-chevron" aria-hidden="true">
                            ›
                          </span>
                        </button>
                        <div
                          className="dm-accordion-body"
                          hidden={!isOpen}
                        >
                          <p className="dm-accordion-desc">{act.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right: city map */}
              <div className="dm-map-col">
                <MapContainer
                  center={center}
                  zoom={13}
                  scrollWheelZoom
                  className="dm-leaflet-map"
                  aria-label={`Map of ${day.city}`}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    maxZoom={19}
                  />

                  <FlyToActivity activity={activeActivity} />

                  {day.activities.map((act, i) => (
                    <Marker
                      key={i}
                      position={[act.coordinates.lat, act.coordinates.lng]}
                      icon={makeActivityIcon(day.countryColor, activeIdx === i)}
                      ref={(el) => (markerRefs.current[i] = el)}
                      eventHandlers={{ click: () => handleAccordionToggle(i) }}
                    >
                      <Popup className="dm-map-popup">
                        <div className="dm-popup-inner">
                          <p className="dm-popup-title" style={{ color: day.countryColor }}>
                            {act.title}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </>
          ) : (
            <InstagramGrid day={day} />
          )}
        </div>
      </div>
    </div>
  );
}

export default DayModal;
