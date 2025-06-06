import { Request, Response } from 'express';
import { Parking, IParking } from '../models/Parking';
import mongoose from 'mongoose';

// Extend the Parking model type to include our methods
interface IParkingDocument extends IParking, mongoose.Document {
  findAvailableSlots(startTime: Date, endTime: Date, vehicleType: string): Promise<any[]>;
}

// Search parking spots with filters
export const searchParking = async (req: Request, res: Response) => {
  try {
    const { location, radius = 5000, duration, vehicleType } = req.query;
    let query: any = {};

    // Location-based search
    if (location) {
      const [longitude, latitude] = JSON.parse(location as string);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: Number(radius)
        }
      };
    }

    const parkingSpots = await Parking.find(query);
    res.json(parkingSpots);
  } catch (error) {
    console.error('Error searching parking:', error);
    res.status(500).json({ message: 'Error searching parking', error });
  }
};

// Get parking spot by ID with availability
export const getParkingById = async (req: Request, res: Response) => {
  try {
    const { startTime, endTime, vehicleType } = req.query;
    const parking = await Parking.findById(req.params.id);
    
    if (!parking) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // If time range is provided, filter available slots
    if (startTime && endTime && vehicleType) {
      const availableSlots = await parking.findAvailableSlots(
        new Date(startTime as string),
        new Date(endTime as string),
        vehicleType as string
      );
      return res.json({
        ...parking.toObject(),
        availableSlots: availableSlots.length,
        slots: availableSlots
      });
    }

    res.json(parking);
  } catch (error) {
    console.error('Error fetching parking spot:', error);
    res.status(500).json({ message: 'Error fetching parking spot', error });
  }
};

// Get user's booking history
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const bookings = await Parking.aggregate([
      { $unwind: '$slots' },
      { $unwind: '$slots.bookings' },
      {
        $match: {
          'slots.bookings.userId': new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $project: {
          _id: '$slots.bookings._id',
          parkingId: '$_id',
          slotId: '$slots.id',
          startTime: '$slots.bookings.startTime',
          endTime: '$slots.bookings.endTime',
          status: '$slots.bookings.status',
          vehicleType: '$slots.bookings.vehicleType',
          parkingLocation: {
            name: '$name',
            address: '$address'
          }
        }
      },
      {
        $sort: {
          startTime: -1
        }
      }
    ]);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching user bookings', error });
  }
};

// Book a parking slot
export const bookParking = async (req: Request, res: Response) => {
  try {
    const { parkingId, slotId } = req.params;
    const { startTime, endTime, vehicleType } = req.body;
    const userId = (req as any).user.userId;

    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // Check if user already has an active booking at this location
    const hasActiveBooking = parking.slots.some(slot => 
      slot.bookings.some(booking => 
        booking.userId.toString() === userId && 
        ['upcoming', 'active'].includes(booking.status)
      )
    );

    if (hasActiveBooking) {
      return res.status(400).json({ 
        message: 'You already have an active booking at this location. Please complete or cancel it first.' 
      });
    }

    // Use the model's bookSlot method
    await parking.bookSlot(
      slotId,
      new mongoose.Types.ObjectId(userId),
      new Date(startTime),
      new Date(endTime),
      vehicleType
    );

    // Get the updated slot to return the booking details
    const updatedSlot = parking.slots.find(s => s.id === slotId);
    const booking = updatedSlot?.bookings[updatedSlot.bookings.length - 1];

    res.json({
      message: 'Parking slot booked successfully',
      booking: {
        _id: booking?._id,
        parkingId,
        slotId,
        startTime,
        endTime,
        vehicleType,
        status: 'upcoming'
      }
    });
  } catch (error: any) {
    console.error('Error booking parking:', error);
    if (error.message === 'Slot not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Slot is not available' || 
        error.message === 'Slot is already booked for this time period' ||
        error.message.includes('already have an active booking')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error booking parking', error: error.message });
  }
};

// Cancel a parking booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { parkingId, slotId, bookingId } = req.params;
    const userId = (req as any).user.userId;

    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    const slot = parking.slots.find(s => s.id === slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    const booking = slot.bookings.find(b => b._id.toString() === bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (only upcoming bookings can be cancelled)
    if (booking.status !== 'upcoming') {
      return res.status(400).json({ message: 'Only upcoming bookings can be cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    parking.availableSlots++; // Increment available slots
    await parking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        status: 'cancelled',
        startTime: booking.startTime,
        endTime: booking.endTime
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error });
  }
};

// Get user's active bookings
export const getUserActiveBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const now = new Date();

    const bookings = await Parking.aggregate([
      { $unwind: '$slots' },
      { $unwind: '$slots.bookings' },
      {
        $match: {
          'slots.bookings.userId': new mongoose.Types.ObjectId(userId),
          'slots.bookings.status': { $in: ['upcoming', 'active'] },
          'slots.bookings.endTime': { $gte: now }
        }
      },
      {
        $project: {
          parkingId: '$_id',
          parkingName: '$name',
          parkingAddress: '$address',
          slotId: '$slots.id',
          slotNumber: '$slots.number',
          booking: '$slots.bookings',
          pricePerHour: '$pricePerHour'
        }
      },
      {
        $sort: {
          'booking.startTime': 1
        }
      }
    ]);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user active bookings:', error);
    res.status(500).json({ message: 'Error fetching user active bookings', error });
  }
}; 