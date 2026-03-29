// Instagram Graph API constants
// Required env vars (add to your .env file):
//   VITE_IG_ACCESS_TOKEN  – long-lived User Access Token from a Business/Creator account
//                           (⚠ keep server-side in production; refresh before 60-day expiry)
//   VITE_IG_USER_ID       – numeric Instagram User ID for the account that owns the token

export const IG_ACCESS_TOKEN = import.meta.env.VITE_IG_ACCESS_TOKEN ?? '';
export const IG_USER_ID      = import.meta.env.VITE_IG_USER_ID      ?? '';

// Proxy path — Vite forwards /instagram-api/* → https://graph.facebook.com/v22.0/*
// (In production replace with an equivalent server-side proxy route.)
export const IG_API_BASE = '/instagram-api/';

// Fields to request for each post
export const IG_MEDIA_FIELDS = [
  'id',
  'media_type',
  'media_url',
  'thumbnail_url',
  'permalink',
  'caption',
  'timestamp',
].join(',');

// Maximum posts to show per tab open
export const IG_MAX_COUNT = 12;
