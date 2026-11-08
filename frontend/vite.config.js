import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Courts',
        short_name: 'Courts',
        description: 'Book Smarter, Play Harder — Sri Lanka\'s indoor futsal booking platform',
        theme_color: '#1D5E3A',
        background_color: '#fafafa',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/logo-mark.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
