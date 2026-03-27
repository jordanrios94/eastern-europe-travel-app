import { useEffect, useRef } from 'react';
import { itinerary } from '../data/itinerary.js';
import './Timeline.css';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PARALLAX_SPEED        = 0.28; // background moves at 28% of scroll speed
const CARD_VISIBILITY_THRESHOLD = 0.12; // 12% of card must be visible to trigger fade-in

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WEEKDAYS[dt.getDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

function Timeline() {
  const sectionRefs = useRef([]);
  const cardRefs    = useRef([]);

  // Parallax: move background slower than scroll
  useEffect(() => {
    const onScroll = () => {
      sectionRefs.current.forEach((section) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const bg = section.querySelector('.tl-bg');
        if (bg) {
          bg.style.transform = `translateY(${rect.top * PARALLAX_SPEED}px)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fade-in cards as they enter the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('tl-card--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: CARD_VISIBILITY_THRESHOLD }
    );
    cardRefs.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="timeline" id="timeline">
      {itinerary.map((day, i) => {
        const isRight = i % 2 !== 0;
        return (
          <section
            key={day.date}
            className="tl-section"
            ref={(el) => (sectionRefs.current[i] = el)}
            style={{ '--accent': day.countryColor }}
            aria-label={`Day ${day.dayNumber}: ${day.city}`}
          >
            {/* Parallax photo */}
            <div
              className="tl-bg"
              style={{ backgroundImage: `url(${day.imageUrl})` }}
              role="img"
              aria-label={`${day.city} scenery`}
            />

            {/* Dark scrim */}
            <div className="tl-overlay" />

            {/* Vertical spine + dot */}
            <div className="tl-spine" aria-hidden="true" />
            <div className="tl-dot"  aria-hidden="true" />

            {/* Content card */}
            <article
              className={`tl-card ${isRight ? 'tl-card--right' : 'tl-card--left'}`}
              ref={(el) => (cardRefs.current[i] = el)}
            >
              {/* Coloured top accent bar */}
              <div className="tl-card-bar" />

              <div className="tl-card-inner">
                {/* Meta row */}
                <div className="tl-meta">
                  <span className="tl-day-badge">Day {day.dayNumber}</span>
                  <span className="tl-date">{formatDate(day.date)}</span>
                </div>

                {/* City heading */}
                <h2 className="tl-city">
                  <span className="tl-flag">{day.flag}</span>
                  {day.city}
                </h2>
                <p className="tl-country" style={{ color: day.countryColor }}>
                  {day.country}
                </p>

                {/* Travel note */}
                {(day.isTravelDay || day.travelNote) && (
                  <div className="tl-travel-note">
                    <span className="tl-travel-icon" aria-hidden="true">✈</span>
                    {day.travelNote}
                  </div>
                )}

                {/* Activities */}
                <ul className="tl-activities">
                  {day.activities.map((act, j) => (
                    <li key={j} className="tl-activity">
                      <span
                        className="tl-pip"
                        style={{ background: day.countryColor }}
                        aria-hidden="true"
                      />
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </section>
        );
      })}

      {/* Journey end marker */}
      <div className="tl-end" aria-label="End of journey">
        <div className="tl-end-dot" />
        <p className="tl-end-label">Journey complete 🎉</p>
      </div>
    </div>
  );
}

export default Timeline;
