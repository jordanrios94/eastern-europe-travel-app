import { useEffect, useRef, useState } from 'react';
import { searchInstagramPosts } from '../services/instagramApi';
import { IG_ACCESS_TOKEN } from '../constants/instagram';
import './InstagramGrid.css';

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

/** Return a thumbnail URL for a post: prefer thumbnail_url (video), fall back to media_url */
function getThumbnail(post) {
  return post.thumbnail_url || post.media_url || null;
}

const STATUS = { IDLE: 'idle', LOADING: 'loading', ERROR: 'error', DONE: 'done' };

export default function InstagramGrid({ day }) {
  const [status,   setStatus]   = useState(STATUS.IDLE);
  const [posts,    setPosts]    = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fetchedForDay = useRef(null);

  useEffect(() => {
    // Avoid re-fetching if the same day is shown
    if (fetchedForDay.current === day.dayNumber) return;
    fetchedForDay.current = day.dayNumber;

    if (!IG_ACCESS_TOKEN) {
      setStatus(STATUS.ERROR);
      setErrorMsg('No Instagram access token configured. Add VITE_IG_ACCESS_TOKEN to your .env file.');
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus(STATUS.LOADING);
      setPosts([]);
      setErrorMsg('');
      try {
        const hashtags = buildHashtags(day);
        const results  = await searchInstagramPosts(hashtags);
        if (!cancelled) {
          setPosts(results);
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
      <div className="igg-state">
        <div className="igg-spinner" aria-label="Loading Instagram posts" />
        <p className="igg-state-text">Searching Instagram for <strong>#{hashtags[0]}</strong>…</p>
      </div>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <div className="igg-state igg-state--error">
        <span className="igg-error-icon" aria-hidden="true">⚠</span>
        <p className="igg-state-text">{errorMsg}</p>
        <p className="igg-state-hint">
          You need an Instagram Business or Creator account and a long-lived User Access Token.
          Add <code>VITE_IG_ACCESS_TOKEN</code> and <code>VITE_IG_USER_ID</code> to your <code>.env</code> file.
          In production, proxy token requests through a backend so the access token stays private.
        </p>
      </div>
    );
  }

  if (status === STATUS.DONE && posts.length === 0) {
    return (
      <div className="igg-state">
        <p className="igg-state-text">No Instagram posts found for this day's activities.</p>
        <p className="igg-state-hint">Hashtags tried: {hashtags.map((h) => `#${h}`).join(', ')}</p>
      </div>
    );
  }

  return (
    <div className="igg-wrapper">
      {/* Hashtag chips */}
      <div className="igg-tags-bar">
        {hashtags.map((tag) => (
          <span key={tag} className="igg-tag" style={{ '--accent': day.countryColor }}>
            #{tag}
          </span>
        ))}
      </div>

      {/* Post grid */}
      <div className="igg-grid">
        {posts.map((post) => (
          <a
            key={post.id}
            className="igg-card"
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View Instagram ${post.media_type === 'VIDEO' ? 'video' : 'post'}`}
          >
            {/* Thumbnail */}
            <div className="igg-thumb-wrap">
              {getThumbnail(post)
                ? <img className="igg-thumb" src={getThumbnail(post)} alt="" loading="lazy" />
                : <div className="igg-thumb igg-thumb--placeholder" />
              }
              <span className="igg-type-badge" aria-hidden="true">
                {post.media_type === 'VIDEO' ? '▶ Video' : '📷'}
              </span>
            </div>

            {/* Card body */}
            {post.caption && (
              <div className="igg-card-body">
                <p className="igg-caption">{post.caption}</p>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
