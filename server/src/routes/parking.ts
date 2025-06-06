import express from 'express';
import {
  searchParking,
  getParkingById,
  bookParking,
  cancelBooking,
  getUserBookings,
  getUserActiveBookings
} from '../controllers/parkingController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/search', searchParking);
router.get('/:id', getParkingById);

// Protected routes
router.use(auth);
router.get('/bookings/history', getUserBookings);
router.get('/bookings/active', getUserActiveBookings);
router.post('/:parkingId/slots/:slotId/book', bookParking);
router.post('/:parkingId/slots/:slotId/bookings/:bookingId/cancel', cancelBooking);

export default router; 