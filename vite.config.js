import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import { createApiRouter } from './server/apiRouter.js'

function aerosarBackendPlugin() {
  return {
    name: 'aerosar-backend-plugin',
    configureServer(server) {
      const app = express();
      app.use('/api', createApiRouter());
      server.middlewares.use(app);
      console.log('[Vite] AeroSAR Tactical Command Backend mounted at /api/*');
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), aerosarBackendPlugin()],
  server: {
    host: true,
    port: 5173
  }
})

