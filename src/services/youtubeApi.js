import { YT_API_KEY, YT_API_BASE, YT_MAX_RESULTS } from '../constants/youtube';

/**
 * Search YouTube for Shorts that match the supplied query string.
 *
 * Uses the YouTube Data API v3 `search.list` endpoint with
 * `videoDuration=short` (under 4 minutes) to target Shorts-length content.
 * Results are linked directly to youtube.com/shorts/<id> so they open in
 * the Shorts player.
 *
 * ⚠️  The API key is sent as a URL query parameter.  In production, restrict
 *     the key to your site's HTTP referrer in the Google Cloud Console so it
 *     cannot be abused if extracted from browser DevTools.
 *
 * @param {string} query – free-text search query, e.g. "sofia bulgaria travel"
 * @returns {Promise<object[]>} array of YouTube search result items
 */
export async function searchYouTubeShorts(query) {
  const params = new URLSearchParams({
    part:          'snippet',
    q:             query,
    type:          'video',
    videoDuration: 'short',
    maxResults:    YT_MAX_RESULTS,
    order:         'relevance',
    safeSearch:    'strict',
    key:           YT_API_KEY,
  });

  const res = await fetch(`${YT_API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `YouTube search failed: ${res.status}`);
  }

  const data = await res.json();
  return data.items ?? [];
}
