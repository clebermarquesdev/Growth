import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY_2 || env.GOOGLE_API_KEY),
        'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        'process.env.GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY_2 || env.GOOGLE_API_KEY),
        'process.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY_2 || env.GOOGLE_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
