import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Parking } from '../models/Parking';
import { parkingLocations } from '../data/parkingLocations';

dotenv.config();

const seedParking = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/park-and-ride');
    console.log('Connected to MongoDB');

    // Clear existing parking data
    await Parking.deleteMany({});
    console.log('Cleared existing parking data');

    // Insert new parking locations
    const parkingDocs = await Parking.insertMany(parkingLocations);
    console.log(`Successfully seeded ${parkingDocs.length} parking locations`);

    // Create indexes
    await Parking.collection.createIndex({ location: '2dsphere' });
    console.log('Created geospatial index');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding parking data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedParking(); 