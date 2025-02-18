import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  define: {
    'process.env': {},
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
}); 