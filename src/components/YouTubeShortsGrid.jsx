import { useEffect, useRef, useState } from 'react';
import { searchYouTubeShorts } from '../services/youtubeApi';
import { YT_API_KEY } from '../constants/youtube';
import './YouTubeShortsGrid.css';

/** Build a YouTube search query for a day's destination and activities */
function buildQuery(day) {
  const slug = (str) => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  const city    = slug(day.city);
  const country = slug(day.country);

  // Up to 2 activity titles for extra specificity
  const activityTerms = (day.activities ?? [])
    .slice(0, 2)
    .map((act) => slug(act.title))
    .filter(Boolean)
    .join(' ');

  return [city, country, activityTerms, 'travel shorts']
    .filter(Boolean)
    .join(' ');
}

/** Pick the best available thumbnail from a YouTube snippet */
function getThumbnail(snippet) {
  const t = snippet.thumbnails;
  return (t?.high ?? t?.medium ?? t?.default)?.url ?? null;
}

const STATUS = { IDLE: 'idle', LOADING: 'loading', ERROR: 'error', DONE: 'done' };

export default function YouTubeShortsGrid({ day }) {
  const [status,      setStatus]      = useState(STATUS.IDLE);
  const [videos,      setVideos]      = useState([]);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const gridRef = useRef(null);

  // Close active player on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActiveVideo(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!YT_API_KEY) {
      setStatus(STATUS.ERROR);
      setErrorMsg('No YouTube API key configured. Add VITE_YT_API_KEY to your .env file.');
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus(STATUS.LOADING);
      setVideos([]);
      setErrorMsg('');
      try {
        const query   = buildQuery(day);
        const results = await searchYouTubeShorts(query);
        if (!cancelled) {
          setVideos(results);
          setStatus(STATUS.DONE);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message ?? 'Unknown error');
          setStatus(STATUS.ERROR);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [day]);

  const query = buildQuery(day);

  if (status === STATUS.LOADING) {
    return (
      <div className="ytg-state">
        <div className="ytg-spinner" aria-label="Loading YouTube Shorts" />
        <p className="ytg-state-text">Searching YouTube Shorts for <strong>{day.city}</strong>…</p>
      </div>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <div className="ytg-state ytg-state--error">
        <span className="ytg-error-icon" aria-hidden="true">⚠</span>
        <p className="ytg-state-text">{errorMsg}</p>
        <p className="ytg-state-hint">
          Create a project in <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>,
          enable the <strong>YouTube Data API v3</strong>, and add the key as{' '}
          <code>VITE_YT_API_KEY</code> in your <code>.env</code> file.
          Restrict the key to your site's HTTP referrer in production.
        </p>
      </div>
    );
  }

  if (status === STATUS.DONE && videos.length === 0) {
    return (
      <div className="ytg-state">
        <p className="ytg-state-text">No YouTube Shorts found for this day's destination.</p>
        <p className="ytg-state-hint">Query used: "{query}"</p>
      </div>
    );
  }

  return (
    <div className="ytg-wrapper">
      {/* Search query pill */}
      <div className="ytg-query-bar" style={{ '--accent': day.countryColor }}>
        <span className="ytg-query-label">Searching:</span>
        <span className="ytg-query-pill">{query}</span>
      </div>

      {/* Shorts grid */}
      <div className="ytg-grid" ref={gridRef}>
        {videos.map((item) => {
          const videoId  = item.id?.videoId;
          const snippet  = item.snippet ?? {};
          const thumb    = getThumbnail(snippet);
          const isActive = activeVideo === videoId;

          return (
            <div key={videoId} className={`ytg-card${isActive ? ' ytg-card--active' : ''}`}>
              {isActive ? (
                /* ── Inline player ── */
                <div className="ytg-player-wrap">
                  <iframe
                    className="ytg-player"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={snippet.title || 'YouTube Short'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    className="ytg-close-btn"
                    onClick={() => setActiveVideo(null)}
                    aria-label="Close player"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                /* ── Thumbnail / click-to-play ── */
                <button
                  className="ytg-card-btn"
                  onClick={() => setActiveVideo(videoId)}
                  aria-label={`Play YouTube Short: ${snippet.title || 'video'}`}
                >
                  <div className="ytg-thumb-wrap">
                    {thumb
                      ? <img className="ytg-thumb" src={thumb} alt="" loading="lazy" />
                      : <div className="ytg-thumb ytg-thumb--placeholder" />
                    }
                    <span className="ytg-play-icon" aria-hidden="true">▶</span>
                    <span className="ytg-shorts-badge" aria-hidden="true">Shorts</span>
                  </div>

                  <div className="ytg-card-body">
                    <p className="ytg-video-title">{snippet.title || '—'}</p>
                    {snippet.channelTitle && (
                      <p className="ytg-channel">{snippet.channelTitle}</p>
                    )}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
