import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'yyc3-icons/**/*.png',
        'yyc3-icons/**/*.webp',
        'yyc3-article-cover-05.png',
      ],
      manifest: {
        name: 'YYC³ 本地多端推理矩阵数据库数据看盘',
        short_name: 'YYC³ Dashboard',
        description: 'YYC³ 本地多端推理矩阵数据库数据看盘，实时监控 AI 推理性能',
        theme_color: '#00d4ff',
        background_color: '#060e1f',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: 'yyc3-icons/pwa/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'yyc3-icons/pwa/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/192\.168\.3\.\d+:3113\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      disableDevLogs: true,
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3118,
    host: true,
    strictPort: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
