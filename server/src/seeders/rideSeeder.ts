import mongoose from 'mongoose';
import { Ride } from '../models/Ride';
import { User } from '../models/User';
import { connectDB } from '../config/database';

// First create a test user if it doesn't exist
const createTestUser = async () => {
  const testUser = await User.findOne({ email: 'test@example.com' });
  if (!testUser) {
    return await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890'
    });
  }
  return testUser;
};

const sampleRides = async (userId: mongoose.Types.ObjectId) => [
  {
    userId,
    driverId: new mongoose.Types.ObjectId().toString(),
    vehicleType: 'Sedan',
    price: 25.00,
    distance: 10.5,
    status: 'pending',
    bookingTime: new Date(Date.now() + 3600000), // 1 hour from now
    from: {
      type: 'Point',
      address: 'Downtown Station',
      coordinates: [-122.4194, 37.7749] // San Francisco coordinates
    },
    to: {
      type: 'Point',
      address: 'Airport Terminal 1',
      coordinates: [-122.3890, 37.6213] // SFO coordinates
    }
  },
  {
    userId,
    driverId: new mongoose.Types.ObjectId().toString(),
    vehicleType: 'SUV',
    price: 35.00,
    distance: 15.2,
    status: 'pending',
    bookingTime: new Date(Date.now() + 7200000), // 2 hours from now
    from: {
      type: 'Point',
      address: 'Financial District',
      coordinates: [-122.4014, 37.7924]
    },
    to: {
      type: 'Point',
      address: 'Golden Gate Park',
      coordinates: [-122.4833, 37.7694]
    }
  },
  {
    userId,
    driverId: new mongoose.Types.ObjectId().toString(),
    vehicleType: 'Sedan',
    price: 20.00,
    distance: 8.3,
    status: 'pending',
    bookingTime: new Date(Date.now() + 10800000), // 3 hours from now
    from: {
      type: 'Point',
      address: 'Union Square',
      coordinates: [-122.4074, 37.7879]
    },
    to: {
      type: 'Point',
      address: 'Fisherman\'s Wharf',
      coordinates: [-122.4194, 37.8080]
    }
  },
  {
    userId,
    driverId: new mongoose.Types.ObjectId().toString(),
    vehicleType: 'Luxury',
    price: 45.00,
    distance: 12.7,
    status: 'pending',
    bookingTime: new Date(Date.now() + 14400000), // 4 hours from now
    from: {
      type: 'Point',
      address: 'Marina District',
      coordinates: [-122.4374, 37.8024]
    },
    to: {
      type: 'Point',
      address: 'AT&T Park',
      coordinates: [-122.3890, 37.7786]
    }
  },
  {
    userId,
    driverId: new mongoose.Types.ObjectId().toString(),
    vehicleType: 'SUV',
    price: 30.00,
    distance: 11.8,
    status: 'pending',
    bookingTime: new Date(Date.now() + 18000000), // 5 hours from now
    from: {
      type: 'Point',
      address: 'Civic Center',
      coordinates: [-122.4174, 37.7793]
    },
    to: {
      type: 'Point',
      address: 'Presidio',
      coordinates: [-122.4664, 37.7989]
    }
  }
];

export const seedRides = async () => {
  try {
    await connectDB();
    
    // Create test user first
    const testUser = await createTestUser();
    
    // Clear existing rides
    await Ride.deleteMany({});
    
    // Insert sample rides with the test user's ID
    const rides = await sampleRides(testUser._id as mongoose.Types.ObjectId);
    await Ride.insertMany(rides);
    
    console.log('Successfully seeded rides');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rides:', error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedRides();
} 