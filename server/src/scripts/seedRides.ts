import mongoose from 'mongoose';
import { Ride } from '../models/Ride';
import dotenv from 'dotenv';

dotenv.config();

const rides = [
  {
    driverId: '1',
    from: {
      type: 'Point',
      coordinates: [80.2707, 13.0827], // Chennai
      address: 'Chennai Central'
    },
    to: {
      type: 'Point',
      coordinates: [80.1918, 13.0837], // Ponneri
      address: 'Ponneri Bus Stand'
    },
    vehicleType: 'Sedan',
    status: 'pending',
    price: 25.50,
    distance: 10.2,
    bookingTime: new Date(Date.now() + 3600000), // 1 hour from now
    driver: {
      name: 'John Doe',
      vehicle: {
        type: 'Sedan',
        model: 'Toyota Camry',
        color: 'Silver',
        plateNumber: 'ABC123'
      },
      rating: 4.8,
      totalRides: 156
    }
  },
  {
    driverId: '2',
    from: {
      type: 'Point',
      coordinates: [80.2707, 13.0827], // Chennai
      address: 'Chennai Central'
    },
    to: {
      type: 'Point',
      coordinates: [80.1918, 13.0837], // Ponneri
      address: 'Ponneri Bus Stand'
    },
    vehicleType: 'SUV',
    status: 'pending',
    price: 35.70,
    distance: 10.2,
    bookingTime: new Date(Date.now() + 7200000), // 2 hours from now
    driver: {
      name: 'Jane Smith',
      vehicle: {
        type: 'SUV',
        model: 'Honda CR-V',
        color: 'Black',
        plateNumber: 'XYZ789'
      },
      rating: 4.9,
      totalRides: 203
    }
  }
];

const seedRides = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/park-and-ride');
    console.log('Connected to MongoDB');

    // Clear existing rides
    await Ride.deleteMany({});
    console.log('Cleared existing rides');

    // Insert new rides
    await Ride.insertMany(rides);
    console.log('Seeded rides successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding rides:', error);
    process.exit(1);
  }
};

seedRides(); 