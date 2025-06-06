import { IParking } from '../models/Parking';

// Sample parking locations with predefined slots
export const parkingLocations: Partial<IParking>[] = [
  {
    name: "Central Metro Station Parking",
    address: "123 Metro Street, Downtown",
    location: {
      type: "Point",
      coordinates: [77.2090, 28.6139] // Delhi coordinates
    },
    totalSlots: 50,
    availableSlots: 50,
    pricePerHour: 30,
    features: ["24/7", "Security", "CCTV", "Well-lit"],
    rating: 4.5,
    reviews: 120,
    slots: Array.from({ length: 50 }, (_, i) => ({
      id: `CMS-${i + 1}`,
      number: `${i + 1}`,
      type: 'standard',
      available: true,
      bookings: []
    }))
  },
  {
    name: "North Terminal Parking",
    address: "456 Terminal Road, North District",
    location: {
      type: "Point",
      coordinates: [77.2295, 28.7041]
    },
    totalSlots: 30,
    availableSlots: 30,
    pricePerHour: 25,
    features: ["Covered", "Security", "CCTV"],
    rating: 4.2,
    reviews: 85,
    slots: Array.from({ length: 30 }, (_, i) => ({
      id: `NTP-${i + 1}`,
      number: `${i + 1}`,
      type: 'standard',
      available: true,
      bookings: []
    }))
  },
  {
    name: "South Plaza Parking",
    address: "789 Plaza Avenue, South District",
    location: {
      type: "Point",
      coordinates: [77.1885, 28.5275]
    },
    totalSlots: 40,
    availableSlots: 40,
    pricePerHour: 35,
    features: ["24/7", "Security", "CCTV", "Valet Service"],
    rating: 4.7,
    reviews: 150,
    slots: Array.from({ length: 40 }, (_, i) => ({
      id: `SPP-${i + 1}`,
      number: `${i + 1}`,
      type: 'standard',
      available: true,
      bookings: []
    }))
  }
]; 