import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index';
import { ENV } from './config/env';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

const app: Express = express();

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resilient Body Parsing Middleware (Protects multipart streams for Multer)
app.use((req: Request, res: Response, next) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();

  // NEVER consume the stream if it's multipart/form-data or product upload route
  if (contentType.includes('multipart') || req.path.includes('/product')) {
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }
    return next();
  }

  // If express.json() already parsed the body, proceed
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }

  // Fallback text parser only for non-multipart requests
  express.text({ type: ['application/json', 'text/*', 'application/*+json'] })(req, res, (err) => {
    if (err) return next(err);
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // ignore
      }
    }
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }
    next();
  });
});

// Serve static frontend files (HTML, CSS, JS) from public folder with clean URL support
app.use(express.static('public', { extensions: ['html'] }));

// Serve uploaded images statically (if local storage fallback is used)
app.use('/uploads', express.static(ENV.UPLOAD_DIR));

// Root API documentation endpoint (fallback when index.html is bypassed)
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Backend Express API aktif (MySQL + JWT + Zod + Cloudinary / Multer)',
    database: `MySQL connected (${ENV.DB_NAME} on ${ENV.DB_HOST}:${ENV.DB_PORT})`,
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      }
    }
  });
});

// Mount API Routes
app.use('/api', apiRoutes);

// 404 Fallback for undefined routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;