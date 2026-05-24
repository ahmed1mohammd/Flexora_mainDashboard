// ============================================================
// تكوين Vite مع إضافة PWA
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'منظومة فليكسورا — إدارة الصالات الرياضية',
        short_name: 'فليكسورا',
        description: 'منظومة إدارية متكاملة لإدارة الصالات الرياضية عبر مصر',
        theme_color: '#E50914',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['business', 'productivity', 'sports'],
        icons: [
          {
            src: 'https://i.ibb.co/gFwNY6cd/fav-Icon-2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'https://i.ibb.co/gFwNY6cd/fav-Icon-2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
        shortcuts: [
          {
            name: 'لوحة التحكم',
            url: '/dashboard',
            description: 'الوصول المباشر للإحصائيات',
          },
          {
            name: 'الصالات الرياضية',
            url: '/gyms',
            description: 'إدارة الصالات المسجلة',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/elegant-playfulness-production-f153\.up\.railway\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'flexora-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 دقائق
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
});
