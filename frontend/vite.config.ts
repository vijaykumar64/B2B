import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode: _mode }) => {
  return {
    root: __dirname,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'ScaleUp Bharat',
          short_name: 'ScaleUp',
          description: "India's Trusted Business Directory",
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'images', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 } },
            },
            {
              urlPattern: /\/api\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'api', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 } },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {},
    server: {
      port: 5173,
      hmr: true,
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
        '/socket.io': { target: 'http://localhost:3001', changeOrigin: true, ws: true },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
