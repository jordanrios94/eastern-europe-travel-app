// YouTube Data API v3 constants
// Required env var (add to your .env file):
//   VITE_YT_API_KEY – API key from Google Cloud Console with the YouTube Data API v3 enabled
//                     (restrict the key to HTTP referrers in production)

export const YT_API_KEY  = import.meta.env.VITE_YT_API_KEY ?? '';
export const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Maximum Shorts to show per tab open
export const YT_MAX_RESULTS = 12;
