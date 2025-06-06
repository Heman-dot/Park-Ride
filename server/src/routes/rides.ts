import express from 'express';
import {
  createRide,
  getRides,
  getRideById,
  updateRideStatus,
  searchRides,
  getUserRides,
  getActiveRides
} from '../controllers/rideController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/search', searchRides);

// Protected routes
router.use(auth);
router.get('/history', getUserRides);
router.get('/active', getActiveRides);
router.get('/:id', getRideById);
router.post('/', createRide);
router.patch('/:rideId/status', updateRideStatus);

export default router; 