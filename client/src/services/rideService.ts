import axios from 'axios';

const API_URL = process.env.REACT_APP_API_UR || 'http://localhost:5002/api';
console.log('API_URL:', API_URL); // Debug log

export interface Location {
  type: 'Point';
  address: string;
  coordinates: number[];
}

export interface Driver {
  id: string;
  name: string;
  vehicle: {
    type: string;
    model: string;
    color: string;
    plateNumber: string;
  };
  rating: number;
  totalRides: number;
  estimatedArrival: string;
  price: number;
  distance: number;
  duration: number;
}

export interface SearchResult {
  distance: number;
  price: number;
  duration: number;
  availableDrivers: Driver[];
  bookingTime: string;
}

export interface Ride {
  _id: string;
  userId: string;
  driverId?: string;
  from: Location;
  to: Location;
  vehicleType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  bookingTime: string;
  completedAt?: string;
  price: number;
  distance: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

const rideService = {
  // Search for available rides
  searchRides: async (params: {
    vehicleType: string;
  }) => {
    console.log('Making request to:', `${API_URL}/rides/search`); // Debug log
    const response = await axios.get(`${API_URL}/rides/search`, {
      params: {
        vehicleType: params.vehicleType
      }
    });
    return response.data as SearchResult;
  },

  // Book a ride
  bookRide: async (params: {
  rideId: string;
  from: {
    address: string;
    coordinates: number[];
  };
  to: {
    address: string;
    coordinates: number[];
  };
}) => {
  // Extract rideId from params
  const { rideId, ...rideData } = params;

  const response = await axios.patch(
    `${API_URL}/rides/${rideId}/status`,
    rideData,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  
  return response.data.ride as Ride;
},


  // Get user's ride history
  getUserRides: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axios.get(`${API_URL}/rides/history`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data as {
      rides: Ride[];
      pagination: {
        total: number;
        page: number;
        pages: number;
      };
    };
  },

  // Get active rides
  getActiveRides: async () => {
    const response = await axios.get(`${API_URL}/rides/active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data as Ride[];
  },

  // Update ride status
  updateRideStatus: async (rideId: string, status: Ride['status']) => {
    const response = await axios.patch(
      `${API_URL}/rides/${rideId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data.ride as Ride;
  }
};

export default rideService; 