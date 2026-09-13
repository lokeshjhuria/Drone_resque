import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createApiRouter } from './apiRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Mount API routes under /api
app.use('/api', createApiRouter());

// Serve production frontend build if dist folder exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root healthcheck fallback if dist not built
  app.get('/', (req, res) => {
    res.json({
      name: 'AeroSAR Autonomous Rescue Command Post Backend API',
      status: 'ONLINE',
      docs: '/api/system/health',
      timestamp: new Date().toISOString()
    });
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AEROSAR TACTICAL SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️  Endpoints: /api/auth/login, /api/auth/register, /api/recon`);
  if (fs.existsSync(distPath)) {
    console.log(`🌐 Serving production frontend from ${distPath}`);
  }
  console.log(`=======================================================`);
});
