import express from 'express';
import cors from 'cors';
import { createApiRouter } from '../server/apiRouter.js';

const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '15mb' }));

// Preflight & CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount router under both /api and root to handle various proxy / serverless rewrite patterns
app.use('/api', createApiRouter());
app.use('/', createApiRouter());

export default app;
