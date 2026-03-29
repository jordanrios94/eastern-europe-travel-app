import {
  IG_ACCESS_TOKEN,
  IG_USER_ID,
  IG_API_BASE,
  IG_MEDIA_FIELDS,
  IG_MAX_COUNT,
} from '../constants/instagram';

/**
 * Resolve a hashtag name to its internal Instagram ID.
 *
 * @param {string} hashtag – plain name without the # sign, e.g. "sofia"
 * @returns {Promise<string|null>} the hashtag ID, or null if not found
 */
async function resolveHashtagId(hashtag) {
  const url =
    `${IG_API_BASE}ig_hashtag_search` +
    `?user_id=${IG_USER_ID}` +
    `&q=${encodeURIComponent(hashtag)}` +
    `&access_token=${IG_ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hashtag lookup failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data?.[0]?.id ?? null;
}

/**
 * Fetch the top public posts for a given Instagram hashtag ID.
 *
 * @param {string} hashtagId – numeric string returned by resolveHashtagId()
 * @returns {Promise<object[]>} array of media objects
 */
async function fetchTopMedia(hashtagId) {
  const url =
    `${IG_API_BASE}${hashtagId}/top_media` +
    `?user_id=${IG_USER_ID}` +
    `&fields=${IG_MEDIA_FIELDS}` +
    `&access_token=${IG_ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Top media fetch failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data ?? [];
}

/**
 * Search Instagram for public posts matching any of the supplied hashtags.
 * Hashtags are tried in priority order; duplicates are deduplicated by ID.
 *
 * ⚠️  The Instagram Graph API allows only 30 unique hashtag IDs to be
 *     queried per 7-day rolling window per connected Instagram account.
 *     The Vite proxy forwards requests to graph.facebook.com so that the
 *     browser never hits CORS restrictions.  In production, move this call
 *     to a backend so VITE_IG_ACCESS_TOKEN is never shipped to the client.
 *
 * @param {string[]} hashtags – plain names without the # sign
 * @returns {Promise<object[]>} up to IG_MAX_COUNT deduplicated post objects
 */
export async function searchInstagramPosts(hashtags) {
  const seen  = new Set();
  const posts = [];

  for (const tag of hashtags) {
    if (posts.length >= IG_MAX_COUNT) break;

    const hashtagId = await resolveHashtagId(tag);
    if (!hashtagId) continue;

    const results = await fetchTopMedia(hashtagId);
    for (const post of results) {
      if (!seen.has(post.id) && posts.length < IG_MAX_COUNT) {
        seen.add(post.id);
        posts.push(post);
      }
    }
  }

  return posts;
}
