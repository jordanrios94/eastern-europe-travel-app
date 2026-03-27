// TikTok Research API constants
// Required env vars (add to your .env file):
//   VITE_TIKTOK_CLIENT_KEY     – your app's client key from developers.tiktok.com
//   VITE_TIKTOK_CLIENT_SECRET  – your app's client secret  (⚠ keep server-side in production)

export const TIKTOK_CLIENT_KEY    = import.meta.env.VITE_TIKTOK_CLIENT_KEY    ?? '';
export const TIKTOK_CLIENT_SECRET = import.meta.env.VITE_TIKTOK_CLIENT_SECRET ?? '';

// Proxy paths — requests go to Vite's dev server which forwards them to TikTok
// server-side, avoiding the browser CORS restriction.
// (In production, replace these with equivalent server-side proxy routes.)
export const TIKTOK_TOKEN_URL       = '/tiktok-token/';
export const TIKTOK_VIDEO_QUERY_URL = '/tiktok-videos/';

// Fields to request for each video
export const TIKTOK_VIDEO_FIELDS = [
  'id',
  'title',
  'video_description',
  'cover_image_url',
  'share_url',
  'author_name',
  'like_count',
  'view_count',
  'create_time',
].join(',');

// Maximum videos to fetch per tab open
export const TIKTOK_MAX_COUNT = 12;
