import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  avatar?: string;
  notifications: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateProfile(updates: Partial<IUser>): Promise<IUser>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (phone: string) => /^\+?[\d\s-]{10,}$/.test(phone),
      message: 'Invalid phone number format'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  avatar: String,
  notifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update profile method
userSchema.methods.updateProfile = async function(updates: Partial<IUser>): Promise<IUser> {
  const allowedUpdates = ['name', 'phoneNumber', 'location', 'avatar', 'notifications'] as const;
  
  for (const key of allowedUpdates) {
    if (key in updates) {
      (this as any)[key] = updates[key];
    }
  }
  
  return this.save();
};

// Method to change password
userSchema.methods.changePassword = async function(currentPassword: string, newPassword: string) {
  const isMatch = await this.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  this.password = newPassword;
  return this.save();
};

export const User = mongoose.model<IUser>('User', userSchema); 