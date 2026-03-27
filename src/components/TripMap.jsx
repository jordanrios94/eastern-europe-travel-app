import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { routeStops } from '../data/itinerary.js';
import 'leaflet/dist/leaflet.css';
import './TripMap.css';

// Route coordinates ordered by journey sequence
const routeCoords = routeStops.map((s) => [s.lat, s.lng]);

// Centre and zoom for the whole itinerary region
const MAP_CENTER = [45.2, 27.5];
const MAP_ZOOM   = 5;

// Build a custom circular div-icon for each city marker
function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker" style="background:${color};box-shadow:0 0 0 3px ${color}44"></div>`,
    iconSize:   [18, 18],
    iconAnchor: [9, 9],
    popupAnchor:[0, -12],
  });
}

// Sub-component: fly to a city when activeIdx changes
function FlyTo({ activeIdx }) {
  const map = useMap();
  useEffect(() => {
    if (activeIdx === null) return;
    const stop = routeStops[activeIdx];
    map.flyTo([stop.lat, stop.lng], 7, { animate: true, duration: 1.2 });
  }, [activeIdx, map]);
  return null;
}

function TripMap() {
  const [activeIdx, setActiveIdx] = useState(null);
  const markerRefs = useRef([]);

  const handleCityClick = (idx) => {
    setActiveIdx(idx);
    // Open the corresponding Leaflet popup after fly-to settles
    setTimeout(() => {
      markerRefs.current[idx]?.openPopup();
    }, 1300);
  };

  return (
    <section className="trip-map-section" id="map" aria-label="Interactive route map">
      <div className="trip-map-header">
        <p className="trip-map-eyebrow">The Journey</p>
        <h2 className="trip-map-title">Interactive Route Map</h2>
        <p className="trip-map-sub">
          Click any city to explore it on the map
        </p>
      </div>

      <div className="trip-map-body">
        {/* ── Sidebar city list ─────────────────────── */}
        <aside className="trip-map-sidebar" aria-label="City list">
          {routeStops.map((stop, i) => (
            <button
              key={stop.city}
              className={`trip-map-city-btn${activeIdx === i ? ' active' : ''}`}
              style={{ '--accent': stop.countryColor }}
              onClick={() => handleCityClick(i)}
              aria-pressed={activeIdx === i}
            >
              <span className="city-btn-index">{i + 1}</span>
              <span className="city-btn-body">
                <span className="city-btn-name">
                  {stop.flag} {stop.city}
                </span>
                <span className="city-btn-country">{stop.country}</span>
              </span>
            </button>
          ))}
        </aside>

        {/* ── Leaflet map ───────────────────────────── */}
        <div className="trip-map-canvas">
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            scrollWheelZoom={false}
            className="leaflet-map"
            aria-label="Route map"
          >
            {/* Dark-toned OpenStreetMap tiles (no API key needed) */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              maxZoom={19}
            />

            {/* Animated fly-to handler */}
            <FlyTo activeIdx={activeIdx} />

            {/* Route polyline */}
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#ffffff',
                weight: 2.5,
                opacity: 0.5,
                dashArray: '8 6',
              }}
            />

            {/* City markers */}
            {routeStops.map((stop, i) => (
              <Marker
                key={stop.city}
                position={[stop.lat, stop.lng]}
                icon={makeIcon(stop.countryColor)}
                ref={(el) => (markerRefs.current[i] = el)}
                eventHandlers={{ click: () => handleCityClick(i) }}
              >
                <Popup className="map-popup">
                  <div className="popup-inner">
                    <p
                      className="popup-city"
                      style={{ color: stop.countryColor }}
                    >
                      {stop.flag} {stop.city}
                    </p>
                    <p className="popup-country">{stop.country}</p>
                    <p className="popup-desc">{stop.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}

export default TripMap;
