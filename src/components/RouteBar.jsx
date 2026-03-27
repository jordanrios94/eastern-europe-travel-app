import { routeStops } from '../data/itinerary.js';
import './RouteBar.css';

function RouteBar() {
  return (
    <div className="route-bar">
      <p className="route-label">Route</p>
      <div className="route-stops">
        {routeStops.map((stop, index) => (
          <span key={stop.city} className="route-stop-wrapper">
            <span
              className="route-stop"
              style={{ color: stop.countryColor }}
            >
              <span className="route-flag">{stop.flag}</span>
              {stop.city}
            </span>
            {index < routeStops.length - 1 && (
              <span className="route-arrow">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RouteBar;
