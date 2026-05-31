// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      open: false,
      allowedHosts: ['community.ctk-tw.com'],

      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    base: '/',
  };
});