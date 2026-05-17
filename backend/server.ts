import 'dotenv/config';
import http from 'http';
import connectDB from './config/db';
import { createBackend, attachSocketIO } from './index';
import { seedDatabase, initAdminUser } from './utils/seedData';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
  await connectDB();
  await seedDatabase();
  await initAdminUser();

  const app = createBackend();
  const httpServer = http.createServer(app);
  attachSocketIO(httpServer, app);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
