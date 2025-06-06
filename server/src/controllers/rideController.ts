import { Request, Response } from 'express';
import { Ride } from '../models/Ride';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Helper function to calculate price based on distance
const calculatePrice = (distance: number, vehicleType: string): number => {
  const baseRate = {
    'Sedan': 2.5,    // $2.5 per km
    'SUV': 3.5,      // $3.5 per km
    'Luxury': 5.0,   // $5.0 per km
    'Van': 4.0,      // $4.0 per km
  }[vehicleType] || 2.5;

  return Math.round(distance * baseRate * 100) / 100; // Round to 2 decimal places
};

// Helper function to calculate distance between two points
const calculateDistance = (from: { coordinates: number[] }, to: { coordinates: number[] }): number => {
  const R = 6371; // Earth's radius in km
  const lat1 = from.coordinates[1] * Math.PI / 180;
  const lat2 = to.coordinates[1] * Math.PI / 180;
  const dLat = (to.coordinates[1] - from.coordinates[1]) * Math.PI / 180;
  const dLon = (to.coordinates[0] - from.coordinates[0]) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const searchRides = async (req: Request, res: Response) => {
  try {
    const { vehicleType } = req.query;
    
    // Validate required parameters
    if (!vehicleType) {
      return res.status(400).json({ message: 'Vehicle type is required' });
    }

    // Fetch all available rides matching vehicle type
    const rides = await Ride.find({
      vehicleType,
      status: 'pending'
    }).sort({ bookingTime: 1 });

    // Format the response with available drivers
    const availableDrivers = rides.map(ride => ({
      id: ride._id,
      name: 'John Doe', // In a real app, fetch from driver collection
      vehicle: {
        type: ride.vehicleType,
        model: 'Toyota Camry', // In a real app, fetch from driver collection
        color: 'Silver',
        plateNumber: 'ABC123'
      },
      rating: 4.8,
      totalRides: 156,
      estimatedArrival: '5 mins',
      price: ride.price,
      distance: ride.distance,
      duration: Math.round(ride.distance * 2) // Rough estimate: 2 mins per km
    }));

    res.json({
      availableDrivers,
      bookingTime: new Date()
    });
  } catch (error) {
    console.error('Error searching rides:', error);
    res.status(500).json({ message: 'Error searching rides', error });
  }
};

export const createRide = async (req: Request, res: Response) => {
  try {
    const { from, to, vehicleType, bookingTime, driverId } = req.body;
    const userId = (req as any).user.userId;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate distance and price
    const distance = calculateDistance(from, to);
    const price = calculatePrice(distance, vehicleType);

    const ride = new Ride({
      userId,
      driverId,
      from,
      to,
      vehicleType,
      bookingTime: new Date(bookingTime),
      status: 'pending',
      price,
      distance,
      createdAt: new Date()
    });

    await ride.save();

    // In a real app, notify the driver here

    res.status(201).json({
      message: 'Ride booked successfully',
      ride: {
        id: ride._id,
        from: ride.from,
        to: ride.to,
        price: ride.price,
        distance: ride.distance,
        bookingTime: ride.bookingTime,
        status: ride.status,
        driver: {
          id: driverId,
          // In a real app, fetch driver details from database
          name: 'John Doe',
          vehicle: {
            type: vehicleType,
            model: 'Toyota Camry',
            color: 'Silver',
            plateNumber: 'ABC123'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Error creating ride', error });
  }
};

export const getRides = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const rides = await Ride.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key

    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ message: 'Error fetching rides', error });
  }
};

export const getRideById = async (req: Request, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id).select('-__v');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is authorized to view this ride
    if (ride.userId.toString() !== (req as any).user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this ride' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ message: 'Error fetching ride', error });
  }
};

export const getUserRides = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { status, limit = 10, page = 1 } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('driverId', 'name vehicle rating totalRides');

    const total = await Ride.countDocuments(query);

    res.json({
      rides,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user rides:', error);
    res.status(500).json({ message: 'Error fetching user rides', error });
  }
};

export const updateRideStatus = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is authorized to update this ride
    if (ride.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[ride.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${ride.status} to ${status}` 
      });
    }

    // Update ride status
    ride.status = status;
    if (status === 'completed') {
      ride.completedAt = new Date();
    }
    await ride.save();

    // In a real app, notify the driver here

    res.json({
      message: 'Ride status updated successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        from: ride.from,
        to: ride.to,
        price: ride.price,
        bookingTime: ride.bookingTime,
        completedAt: ride.completedAt
      }
    });
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ message: 'Error updating ride status', error });
  }
};

export const getActiveRides = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const rides = await Ride.find({
      userId,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    })
    .sort({ bookingTime: 1 })
    .populate('driverId', 'name vehicle rating totalRides');

    res.json(rides);
  } catch (error) {
    console.error('Error fetching active rides:', error);
    res.status(500).json({ message: 'Error fetching active rides', error });
  }
};

export const bookRide = async (req: Request, res: Response) => {
  try {
    const { rideId, from, to } = req.body;
    const userId = (req as any).user.id;

    // Validate required fields
    if (!rideId || !from || !to) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the original ride
    const originalRide = await Ride.findById(rideId);
    if (!originalRide) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (originalRide.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }

    // Create a new ride for the user with their specific locations
    const userRide = new Ride({
      ...originalRide.toObject(),
      _id: new mongoose.Types.ObjectId(), // Generate new ID
      userId,
      from: {
        address: from.address,
        coordinates: from.coordinates
      },
      to: {
        address: to.address,
        coordinates: to.coordinates
      },
      status: 'confirmed',
      bookingTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update original ride status to confirmed
    originalRide.status = 'confirmed';
    await originalRide.save();

    // Save the user's ride
    await userRide.save();

    res.status(201).json({
      message: 'Ride booked successfully',
      ride: userRide
    });
  } catch (error) {
    console.error('Error booking ride:', error);
    res.status(500).json({ message: 'Error booking ride', error });
  }
}; 