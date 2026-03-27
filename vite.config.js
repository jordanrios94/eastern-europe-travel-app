import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tiktok-token': {
        target: 'https://open.tiktokapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tiktok-token/, '/v2/oauth/token'),
      },
      '/tiktok-videos': {
        target: 'https://open.tiktokapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tiktok-videos/, '/v2/research/video/query'),
      },
    },
  },
});
