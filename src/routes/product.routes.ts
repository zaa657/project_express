import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

// Public routes: Anyone can browse products and view details
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Protected routes: Authenticated users can create products
// Note: Multer middleware must run before validate middleware so multipart fields are in req.body
router.post(
  '/',
  authenticate,
  upload.single('image'),
  validate(createProductSchema),
  ProductController.create
);

// Protected routes: User can update their own products (Admin can update any product)
router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  validate(updateProductSchema),
  ProductController.update
);

// Protected routes: User can delete their own products (Admin can delete any product)
router.delete('/:id', authenticate, ProductController.delete);

export default router;
