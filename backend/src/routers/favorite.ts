import { Router } from 'express';
import { toggleFavorite, getFavorites, getFavorite } from '@/controllers/favorite';
import { authenticate, isVerified } from '@/middleware/auth';
import { catchAsync } from '@/middleware/catch-async';

const router = Router();

router.post('/', authenticate, isVerified, catchAsync(toggleFavorite));
router.get('/', authenticate, isVerified, catchAsync(getFavorites));
router.get('/is-favorite', authenticate, isVerified, catchAsync(getFavorite));

export default router;
