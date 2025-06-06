import express from 'express';
import { auth } from '../middleware/auth';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.post('/avatar', auth, uploadAvatar);

export default router; 