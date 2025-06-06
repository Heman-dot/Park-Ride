import mongoose, { Document } from 'mongoose';

export interface IRide extends Document {
  userId: mongoose.Types.ObjectId;
  driverId?: string;
  from: {
    type: string;
    coordinates: number[];
    address: string;
  };
  to: {
    type: string;
    coordinates: number[];
    address: string;
  };
  vehicleType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  bookingTime: Date;
  completedAt?: Date;
  price: number;
  distance: number;
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: String,
    required: false
  },
  from: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords: number[]) => coords.length === 2 && 
          coords[0] >= -180 && coords[0] <= 180 && 
          coords[1] >= -90 && coords[1] <= 90,
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      required: true
    }
  },
  to: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords: number[]) => coords.length === 2 && 
          coords[0] >= -180 && coords[0] <= 180 && 
          coords[1] >= -90 && coords[1] <= 90,
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      required: true
    }
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Luxury', 'Van']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  bookingTime: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: false
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  distance: {
    type: Number,
    required: true,
    min: [0, 'Distance cannot be negative']
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Create indexes for geospatial queries
rideSchema.index({ 'from.coordinates': '2dsphere' });
rideSchema.index({ 'to.coordinates': '2dsphere' });

export const Ride = mongoose.model<IRide>('Ride', rideSchema); 