import axios from 'axios';

// Ensure the API URL includes /api
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5002').replace(/\/api$/, '') + '/api';

export interface ParkingLocation {
  _id: string;
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  features: string[];
  rating: number;
  reviews: number;
  slots: ParkingSlot[];
}

export interface ParkingSlot {
  id: string;
  number: string;
  type: string;
  available: boolean;
  bookings: {
    _id: string;
    userId: string;
    startTime: string;
    endTime: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    vehicleType: string;
  }[];
}

export interface ParkingBooking {
  _id: string;
  parkingId: string;
  slotId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  price: number;
  vehicleType: string;
  createdAt: string;
  parkingLocation: ParkingLocation;
}

const parkingService = {
  // Search for parking locations - fetch all
  searchParking: async () => {
    try {
      const response = await axios.get(`${API_URL}/parking/search`);
      return response.data as ParkingLocation[];
    } catch (error) {
      console.error('Error searching parking:', error);
      throw error;
    }
  },

  // Get parking location details - fetch all slots
  getParkingDetails: async (parkingId: string) => {
    try {
      const response = await axios.get(`${API_URL}/parking/${parkingId}`);
      return response.data as ParkingLocation;
    } catch (error) {
      console.error('Error getting parking details:', error);
      throw error;
    }
  },

  // Book a parking slot
  bookSlot: async (parkingId: string, slotId: string, bookingData: {
    startTime: string;
    endTime: string;
    vehicleType: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_URL}/parking/${parkingId}/slots/${slotId}/book`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error booking slot:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (parkingId: string, slotId: string, bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_URL}/parking/${parkingId}/slots/${slotId}/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  // Get user's parking history
  getParkingHistory: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/parking/bookings/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data as ParkingBooking[];
    } catch (error) {
      console.error('Error getting parking history:', error);
      throw error;
    }
  },

  // Get current active booking
  getActiveBooking: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/parking/bookings/active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data as ParkingBooking | null;
    } catch (error) {
      console.error('Error getting active booking:', error);
      throw error;
    }
  }
};

export default parkingService; 