import './Calendar.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// June 2026: 30 days, starts on Monday (day index 1)
const JUNE_2026_FIRST_DAY = 1; // Monday (0=Sun)
const JUNE_2026_TOTAL_DAYS = 30;
const JUNE_2026_DATE_PREFIX = '2026-06';

function Calendar({ itinerary, selectedDay, onDayClick }) {
  // Build a map of date string -> itinerary day
  const itineraryMap = {};
  itinerary.forEach((day) => {
    const dateNum = parseInt(day.date.split('-')[2], 10);
    itineraryMap[dateNum] = day;
  });

  // Build calendar cells: leading blanks + day numbers
  const cells = [];
  for (let i = 0; i < JUNE_2026_FIRST_DAY; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= JUNE_2026_TOTAL_DAYS; d++) {
    cells.push(d);
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2 className="calendar-month">June 2026</h2>
      </div>

      <div className="calendar-grid">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className="calendar-cell blank" />;
          }

          const tripDay = itineraryMap[day];
          const isTrip = Boolean(tripDay);
          const isSelected = selectedDay && selectedDay.date === `${JUNE_2026_DATE_PREFIX}-${String(day).padStart(2, '0')}`;

          const style = isTrip
            ? { '--country-color': tripDay.countryColor }
            : {};

          return (
            <div
              key={day}
              className={[
                'calendar-cell',
                isTrip ? 'trip-day' : 'non-trip-day',
                isSelected ? 'selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={style}
              onClick={isTrip ? () => onDayClick(tripDay) : undefined}
              role={isTrip ? 'button' : undefined}
              tabIndex={isTrip ? 0 : undefined}
              onKeyDown={
                isTrip
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onDayClick(tripDay);
                      }
                    }
                  : undefined
              }
              aria-label={
                isTrip
                  ? `Day ${tripDay.dayNumber}: ${tripDay.city}, ${tripDay.country}`
                  : undefined
              }
            >
              <span className="cell-day-number">{day}</span>

              {isTrip && (
                <div className="cell-trip-info">
                  <span className="cell-flag">{tripDay.flag}</span>
                  <span className="cell-city">{tripDay.city}</span>
                  {tripDay.isTravelDay && (
                    <span className="cell-travel-badge">✈</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#00966E' }} />
          <span>Bulgaria</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#002B7F' }} />
          <span>Romania</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#005BBB' }} />
          <span>Ukraine</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#003DA5' }} />
          <span>Moldova</span>
        </div>
        <div className="legend-item">
          <span className="legend-plane">✈</span>
          <span>Travel day</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
