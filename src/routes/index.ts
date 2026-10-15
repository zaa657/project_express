import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API Express berjalan dengan baik',
    timestamp: new Date().toISOString()
  });
});

// Mount modules (supports both /products and singular /product)
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/product', productRoutes);
router.use('/admin', adminRoutes);

export default router;
