import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Interfaces
interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleDetails: {
    model: string;
    color: string;
    licensePlate: string;
  };
}

interface Ride {
  _id: string;
  origin: Location;
  destination: Location;
  status: 'pending' | 'completed' | 'cancelled';
  bookingTime: string;
  vehicleType: string;
  price: number;
  driver?: Driver;
}

interface RideHistoryListProps {
  rides: Ride[];
  loading: boolean;
  error: string | null;
  onCancelRide?: (rideId: string) => void;
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const RideHistoryList: React.FC<RideHistoryListProps> = ({
  rides,
  loading,
  error,
  onCancelRide,
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && rides.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No rides found
        </Alert>
      )}

      {rides.map((ride) => (
        <StyledCard key={ride._id}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Ride Details
                </Typography>
                <Chip
                  label={ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(ride.status),
                    color: theme.palette.getContrastText(getStatusColor(ride.status)),
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                />
              </Box>
              {ride.status === 'pending' && onCancelRide && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onCancelRide(ride._id)}
                >
                  Cancel Ride
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  From: {ride.origin.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  To: {ride.destination.address}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DirectionsCarIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="body2">
                {ride.vehicleType.charAt(0).toUpperCase() + ride.vehicleType.slice(1)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="body2">
                {formatDate(ride.bookingTime)}
              </Typography>
            </Box>

            {ride.driver && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2">
                  Driver: {ride.driver.name}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${ride.price.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
};

export default RideHistoryList; 