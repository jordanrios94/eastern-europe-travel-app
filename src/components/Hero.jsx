import { useEffect, useRef } from 'react';
import { routeStops } from '../data/itinerary.js';
import './Hero.css';

const HERO_PARALLAX_SPEED = 0.4; // background moves at 40% of scroll speed

function Hero() {
  const bgRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * HERO_PARALLAX_SPEED}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" aria-label="Trip overview">
      <div className="hero-bg" ref={bgRef} />
      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-eyebrow">15 – 28 June 2026</p>
        <h1 className="hero-title">Eastern Europe</h1>
        <p className="hero-subtitle">14 days · 4 countries · 8 cities</p>

        <div className="hero-route">
          {routeStops.map((stop, i) => (
            <span key={stop.city} className="hero-route-item">
              <span
                className="hero-route-city"
                style={{ color: stop.countryColor }}
              >
                {stop.flag} {stop.city}
              </span>
              {i < routeStops.length - 1 && (
                <span className="hero-route-arrow">→</span>
              )}
            </span>
          ))}
        </div>

        <div className="hero-countries">
          {[
            { label: 'Bulgaria', color: '#00966E', flag: '🇧🇬' },
            { label: 'Romania',  color: '#002B7F', flag: '🇷🇴' },
            { label: 'Ukraine',  color: '#005BBB', flag: '🇺🇦' },
            { label: 'Moldova',  color: '#003DA5', flag: '🇲🇩' },
          ].map((c) => (
            <span
              key={c.label}
              className="hero-country-chip"
              style={{ borderColor: c.color, color: c.color }}
            >
              {c.flag} {c.label}
            </span>
          ))}
        </div>

        <a href="#timeline" className="hero-scroll-cue" aria-label="Scroll to timeline">
          <span className="scroll-text">Scroll to explore</span>
          <span className="scroll-arrow">↓</span>
        </a>
      </div>
    </section>
  );
}

export default Hero;
