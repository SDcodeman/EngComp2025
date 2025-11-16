import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // expose to your LAN
    port: 5174,      // use a free port
    strictPort: true // don't auto-change it
  },
});
