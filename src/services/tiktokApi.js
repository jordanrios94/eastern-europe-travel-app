import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_TOKEN_URL,
  TIKTOK_VIDEO_QUERY_URL,
  TIKTOK_VIDEO_FIELDS,
  TIKTOK_MAX_COUNT,
} from '../constants/tiktok';

/**
 * Obtain a client-credentials access token from TikTok.
 *
 * ⚠️  In production this exchange should happen on a server so that
 *     TIKTOK_CLIENT_SECRET is never shipped to the browser.
 *     For development / prototyping a Vite proxy or a thin serverless
 *     function can forward the request.
 */
export async function getTikTokAccessToken() {
  const body = new URLSearchParams({
    client_key:    TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    grant_type:    'client_credentials',
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = await res.json();
  const token = data.access_token;
  if (!token) {
    throw new Error(
      `Token request succeeded but no access_token was returned. ` +
      `Check that your VITE_TIKTOK_CLIENT_KEY and VITE_TIKTOK_CLIENT_SECRET are correct ` +
      `and that your app has Research API access. TikTok response: ${JSON.stringify(data)}`
    );
  }
  return token;
}

/**
 * Search TikTok videos that match any of the supplied hashtags.
 *
 * @param {string[]} hashtags  – plain names without the # sign, e.g. ["sofia","bulgaria"]
 * @param {string}   token     – bearer access token from getTikTokAccessToken()
 * @returns {Promise<object[]>}  array of video objects
 */
export async function searchTikTokVideos(hashtags, token) {
  // Use a date window covering the last two years for fresh content
  const now       = new Date();
  const end_date  = formatDate(now);
  const start     = new Date(now);
  start.setFullYear(start.getFullYear() - 2);
  const start_date = formatDate(start);

  const payload = {
    query: {
      and: [
        {
          operation:   'IN',
          field_name:  'hashtag_name',
          field_values: hashtags,
        },
      ],
    },
    max_count:  TIKTOK_MAX_COUNT,
    cursor:     0,
    start_date,
    end_date,
  };

  const res = await fetch(`${TIKTOK_VIDEO_QUERY_URL}?fields=${TIKTOK_VIDEO_FIELDS}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Video search failed: ${res.status}`);
  const data = await res.json();
  return data?.data?.videos ?? [];
}

/** Format a Date as YYYYMMDD required by the Research API */
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}
