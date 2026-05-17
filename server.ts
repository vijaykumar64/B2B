import 'dotenv/config';
import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './backend/config/db';
import { createBackend, attachSocketIO } from './backend/index';
import { seedDatabase, initAdminUser } from './backend/utils/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const isDev = process.env.NODE_ENV !== 'production';

async function start() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Seed initial data if empty
  await seedDatabase();
  await initAdminUser();

  // 3. Create Express app with all API routes
  const app = createBackend();

  // 4. Attach Vite dev server (dev) or serve static build (prod)
  if (isDev) {
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, 'frontend/vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Create HTTP server and attach Socket.io
  const httpServer = http.createServer(app);
  attachSocketIO(httpServer, app);

  // 6. Start listening
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Mode: ${isDev ? 'development' : 'production'}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
