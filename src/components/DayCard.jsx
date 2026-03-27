import './DayCard.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return `${DAY_NAMES[dateObj.getDay()]}, ${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function DayCard({ day, onClose }) {
  return (
    <>
      <div className="daycard-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="daycard"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for Day ${day.dayNumber}`}
        style={{ '--country-color': day.countryColor }}
      >
        <button
          className="daycard-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="daycard-header" style={{ borderColor: day.countryColor }}>
          <div className="daycard-day-badge" style={{ background: day.countryColor }}>
            Day {day.dayNumber}
          </div>
          <div className="daycard-flag-city">
            <span className="daycard-flag">{day.flag}</span>
            <div>
              <h2 className="daycard-city">{day.city}</h2>
              <p className="daycard-country" style={{ color: day.countryColor }}>
                {day.country}
              </p>
            </div>
          </div>
          <p className="daycard-date">{formatDate(day.date)}</p>
        </div>

        {(day.isTravelDay || day.travelNote) && (
          <div className="daycard-travel-note">
            <span className="daycard-travel-icon">✈</span>
            <span>{day.travelNote}</span>
          </div>
        )}

        <div className="daycard-body">
          <h3 className="daycard-section-title">Things to do</h3>
          <ul className="daycard-activities">
            {day.activities.map((activity, i) => (
              <li key={i} className="daycard-activity">
                <span
                  className="daycard-activity-dot"
                  style={{ background: day.countryColor }}
                />
                {activity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default DayCard;
