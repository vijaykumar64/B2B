import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { verifyToken } from './config/jwt';
import { env } from './config/env';
import { logger } from './config/logger';
import User from './models/User';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes individually so /api and /api/v1 can share the same router
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import opportunityRoutes from './routes/opportunities';
import applicationRoutes from './routes/applications';
import conversationRoutes from './routes/conversations';
import notificationRoutes from './routes/notifications';
import activityRoutes from './routes/activities';
import callbackRoutes from './routes/callbacks';
import feedbackRoutes from './routes/feedback';
import influencerRoutes from './routes/influencers';
import aiRoutes from './routes/ai';

const buildCorsOptions = () => ({
  origin: env.NODE_ENV === 'production'
    ? env.CORS_ORIGIN.split(',').map((o: string) => o.trim())
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

const mountRoutes = (app: express.IRouter) => {
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/opportunities', opportunityRoutes);
  app.use('/applications', applicationRoutes);
  app.use('/conversations', conversationRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/activities', activityRoutes);
  app.use('/callbacks', callbackRoutes);
  app.use('/feedback', feedbackRoutes);
  app.use('/influencers', influencerRoutes);
  app.use('/ai', aiRoutes);
};

export const createBackend = (existingApp?: express.Application) => {
  const app = existingApp || express();

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Unsplash/Cloudinary images
    contentSecurityPolicy: false, // Vite dev server conflicts — enable in production with proper config
  }));

  app.use(cors(buildCorsOptions()));

  // Body parsing with tight limits — large payloads (images) are handled by multer
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Strip MongoDB operator keys from request body/query/params
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution attacks
  app.use(hpp());

  // Structured HTTP request logging
  app.use(requestLogger);

  // Health check — responds before routes, no auth needed
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV })
  );

  // Mount at /api/* (existing — preserves all frontend API calls)
  const apiRouter = express.Router();
  mountRoutes(apiRouter);
  app.use('/api', apiRouter);

  // Mount at /api/v1/* (new — for versioned clients and future use)
  const apiV1Router = express.Router();
  mountRoutes(apiV1Router);
  app.use('/api/v1', apiV1Router);

  app.use(errorHandler);

  return app;
};

export const attachSocketIO = (server: http.Server, app: express.Application) => {
  const corsOptions = buildCorsOptions();

  const io = new SocketIOServer(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
  });

  // Authenticated socket middleware — allow unauthenticated for public browsing
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          (socket as any).user = user;
          socket.join(`user:${user._id.toString()}`);
        }
      }
      next();
    } catch (err) {
      logger.warn('socket_auth_failed', { error: (err as Error).message });
      next(); // allow unauthenticated sockets for public opportunities
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:chat', (chatId: string) => {
      if (typeof chatId === 'string') socket.join(`chat:${chatId}`);
    });

    socket.on('leave:chat', (chatId: string) => {
      if (typeof chatId === 'string') socket.leave(`chat:${chatId}`);
    });

    socket.on('disconnect', () => {});
  });

  // Inject io into all request objects so controllers can emit events
  app.use((req: any, _res, next) => {
    req.io = io;
    next();
  });

  return io;
};
