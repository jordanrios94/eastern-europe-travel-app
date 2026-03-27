import { useEffect, useRef, useState } from 'react';
import { getTikTokAccessToken, searchTikTokVideos } from '../services/tiktokApi';
import { TIKTOK_CLIENT_KEY } from '../constants/tiktok';
import './TikTokGrid.css';

/** Build a prioritised list of hashtag strings for a day */
function buildHashtags(day) {
  const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const citySlug    = slug(day.city);
  const countrySlug = slug(day.country);

  const tags = new Set([
    citySlug,
    countrySlug,
    `${citySlug}travel`,
    `visit${countrySlug}`,
    `${countrySlug}travel`,
    'easterneurope',
    'travel',
  ]);

  // Add up to 4 activity-name hashtags
  (day.activities ?? []).slice(0, 4).forEach((act) => {
    tags.add(slug(act.title));
  });

  return [...tags].filter(Boolean);
}

/** Friendly number formatter: 12400 → "12.4K" */
function fmtCount(n) {
  if (n === undefined || n === null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const STATUS = { IDLE: 'idle', LOADING: 'loading', ERROR: 'error', DONE: 'done' };

export default function TikTokGrid({ day }) {
  const [status,  setStatus]  = useState(STATUS.IDLE);
  const [videos,  setVideos]  = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fetchedForDay = useRef(null);

  useEffect(() => {
    // Avoid re-fetching if the same day is shown
    if (fetchedForDay.current === day.dayNumber) return;
    fetchedForDay.current = day.dayNumber;

    if (!TIKTOK_CLIENT_KEY) {
      setStatus(STATUS.ERROR);
      setErrorMsg('No TikTok client key configured. Add VITE_TIKTOK_CLIENT_KEY to your .env file.');
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus(STATUS.LOADING);
      setVideos([]);
      setErrorMsg('');
      try {
        const token = await getTikTokAccessToken();
        const hashtags = buildHashtags(day);
        const results  = await searchTikTokVideos(hashtags, token);
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

  const hashtags = buildHashtags(day);

  if (status === STATUS.LOADING) {
    return (
      <div className="ttg-state">
        <div className="ttg-spinner" aria-label="Loading TikTok videos" />
        <p className="ttg-state-text">Searching TikTok for <strong>#{hashtags[0]}</strong>…</p>
      </div>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <div className="ttg-state ttg-state--error">
        <span className="ttg-error-icon" aria-hidden="true">⚠</span>
        <p className="ttg-state-text">{errorMsg}</p>
        <p className="ttg-state-hint">
          Make sure you have a TikTok Research API account and your <code>.env</code> credentials are set.
          In production, proxy token requests through a backend so the client secret stays private.
        </p>
      </div>
    );
  }

  if (status === STATUS.DONE && videos.length === 0) {
    return (
      <div className="ttg-state">
        <p className="ttg-state-text">No TikTok videos found for this day's activities.</p>
        <p className="ttg-state-hint">Hashtags tried: {hashtags.map((h) => `#${h}`).join(', ')}</p>
      </div>
    );
  }

  return (
    <div className="ttg-wrapper">
      {/* Hashtag chips */}
      <div className="ttg-tags-bar">
        {hashtags.map((tag) => (
          <span key={tag} className="ttg-tag" style={{ '--accent': day.countryColor }}>
            #{tag}
          </span>
        ))}
      </div>

      {/* Video grid */}
      <div className="ttg-grid">
        {videos.map((video) => (
          <a
            key={video.id}
            className="ttg-card"
            href={video.share_url ?? `https://www.tiktok.com/@${video.author_name}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${video.title || 'TikTok video'} by @${video.author_name}`}
          >
            {/* Thumbnail */}
            <div className="ttg-thumb-wrap">
              {video.cover_image_url
                ? <img className="ttg-thumb" src={video.cover_image_url} alt="" loading="lazy" />
                : <div className="ttg-thumb ttg-thumb--placeholder" />
              }
              <span className="ttg-play-icon" aria-hidden="true">▶</span>
              {video.view_count !== undefined && (
                <span className="ttg-view-badge">{fmtCount(video.view_count)} views</span>
              )}
            </div>

            {/* Card footer */}
            <div className="ttg-card-body">
              <p className="ttg-video-title">{video.title || video.video_description || '—'}</p>
              <div className="ttg-card-meta">
                <span className="ttg-author">@{video.author_name}</span>
                {video.like_count !== undefined && (
                  <span className="ttg-likes">♥ {fmtCount(video.like_count)}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
