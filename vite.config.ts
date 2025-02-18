import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    'process.env': {},
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.railway.app',
      '.up.railway.app',
      'healthcheck.railway.app'
    ],
  },
}); 