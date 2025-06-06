import mongoose, { Document, Schema } from 'mongoose';

// Define the slot and booking interfaces
export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  vehicleType: string;
  toObject(): any;
}

export interface ISlot {
  id: string;
  number: string;
  type: string;
  available: boolean;
  bookings: IBooking[];
}

// Define the parking interface with methods
export interface IParking extends Document {
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  rating: number;
  reviews: number;
  features: string[];
  slots: ISlot[];
  createdAt: Date;
  updatedAt: Date;
  
  // Model methods
  findAvailableSlots(startTime: Date, endTime: Date, vehicleType: string): Promise<ISlot[]>;
  bookSlot(slotId: string, userId: mongoose.Types.ObjectId, startTime: Date, endTime: Date, vehicleType: string): Promise<IParking>;
  cancelBooking(slotId: string, bookingId: mongoose.Types.ObjectId): Promise<IParking>;
}

const parkingSchema = new Schema<IParking>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  location: {
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
    }
  },
  totalSlots: {
    type: Number,
    required: true,
    min: [1, 'Total slots must be at least 1']
  },
  availableSlots: {
    type: Number,
    required: true,
    min: [0, 'Available slots cannot be negative'],
    validate: {
      validator: function(this: IParking, value: number) {
        return value <= this.totalSlots;
      },
      message: 'Available slots cannot exceed total slots'
    }
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: [0, 'Price per hour cannot be negative']
  },
  features: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  slots: [{
    id: {
      type: String,
      required: true,
      unique: true
    },
    number: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    available: {
      type: Boolean,
      default: true
    },
    bookings: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      startTime: {
        type: Date,
        required: true
      },
      endTime: {
        type: Date,
        required: true,
        validate: {
          validator: function(this: any, value: Date) {
            return value > this.startTime;
          },
          message: 'End time must be after start time'
        }
      },
      status: {
        type: String,
        enum: ['upcoming', 'active', 'completed', 'cancelled'],
        default: 'upcoming'
      },
      vehicleType: {
        type: String,
        required: true,
        enum: ['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle']
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
parkingSchema.index({ location: '2dsphere' });
parkingSchema.index({ 'slots.id': 1 });
parkingSchema.index({ 'slots.bookings.userId': 1 });
parkingSchema.index({ 'slots.bookings.status': 1 });

// Method to find available slots
parkingSchema.methods.findAvailableSlots = async function(
  startTime: Date,
  endTime: Date,
  vehicleType: string
): Promise<ISlot[]> {
  const availableSlots = this.slots.filter((slot: ISlot) => {
    // Check if slot is available and matches vehicle type
    if (!slot.available || slot.type !== vehicleType) {
      return false;
    }

    // Check if slot has any overlapping bookings
    const hasOverlappingBooking = slot.bookings.some((booking: IBooking) => {
      if (booking.status === 'cancelled') {
        return false;
      }
      return (
        (booking.startTime <= endTime && booking.endTime >= startTime)
      );
    });

    return !hasOverlappingBooking;
  });

  return availableSlots;
};

// Method to book a slot
parkingSchema.methods.bookSlot = async function(
  slotId: string,
  userId: mongoose.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  vehicleType: string
): Promise<void> {
  const slot = this.slots.find((s: ISlot) => s.id === slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }

  // Check if user already has an active booking at this location
  const hasActiveBooking = this.slots.some((s: ISlot) => 
    s.bookings.some((booking: IBooking) => 
      booking.userId.toString() === userId.toString() && 
      ['upcoming', 'active'].includes(booking.status)
    )
  );

  if (hasActiveBooking) {
    throw new Error('You already have an active booking at this location. Please complete or cancel it first.');
  }

  // Check if slot is available for the requested time period
  const isSlotAvailable = !slot.bookings.some((booking: IBooking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    return (
      (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
      (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
      (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
    );
  });

  if (!isSlotAvailable) {
    throw new Error('Slot is already booked for this time period');
  }

  // Create new booking
  const booking = {
    userId,
    startTime,
    endTime,
    vehicleType,
    status: 'upcoming' as const,
    createdAt: new Date()
  };

  slot.bookings.push(booking);
  await this.save();
};

// Method to cancel a booking
parkingSchema.methods.cancelBooking = async function(
  slotId: string,
  bookingId: mongoose.Types.ObjectId
) {
  const slot = this.slots.find((s: { id: string }) => s.id === slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }
  
  const booking = slot.bookings.id(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  
  if (booking.status === 'completed') {
    throw new Error('Cannot cancel a completed booking');
  }
  
  booking.status = 'cancelled';
  this.availableSlots++;
  return this.save();
};

export const Parking = mongoose.model<IParking>('Parking', parkingSchema); 