import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Rating,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  ArrowBack as BackIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import rideService from '../../services/rideService';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const BookButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#fff !important',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '&:hover': {
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

interface Location {
  address: string;
  coordinates: number[];
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  totalRides: number;
  vehicle: {
    type: string;
    model: string;
    color: string;
    plateNumber: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  estimatedArrival: string;
  price: number;
  distance: number;
  duration: number;
}

interface SearchResult {
  availableDrivers: Driver[];
  bookingTime: string;
  fromCoordinates: string;
  toCoordinates: string;
  distance: number;
  price: number;
  duration: number;
}

const RideResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const { searchResults, from, to, vehicleType } = location.state as {
    searchResults: SearchResult;
    from: string;
    to: string;
    vehicleType: string;
  };
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBookRide = async (driver: Driver) => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we'll use fixed coordinates
      // In a real app, you would use a geocoding service to convert addresses to coordinates
      const fromCoords = [77.2090, 28.6139]; // Delhi coordinates [longitude, latitude]
      const toCoords = [77.1025, 28.7041];   // Another location in Delhi [longitude, latitude]

      const ride = await rideService.bookRide({
        rideId: driver.id,
        from: {
          address: from,
          coordinates: fromCoords
        },
        to: {
          address: to,
          coordinates: toCoords
        }
      });

      navigate('/rides/history', { state: { rideId: ride._id } });
    } catch (err: any) {
      console.error('Error booking ride:', err);
      setError(err.response?.data?.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Container maxWidth="sm" sx={{ background: 'transparent', p: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ pt: 2, pb: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                mb: 2,
                backgroundColor: alpha(theme.palette.common.white, 0.9),
                '&:hover': {
                  backgroundColor: theme.palette.common.white,
                },
              }}
            >
              <BackIcon />
            </IconButton>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              Available Rides
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="primary" />
                      <Typography variant="body1" color="text.secondary">
                        From: {from}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="primary" />
                      <Typography variant="body1" color="text.secondary">
                        To: {to}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CarIcon color="primary" />
                        <Typography variant="body1">
                          {vehicleType}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon color="primary" />
                        <Typography variant="body1">
                          {searchResults.duration} mins
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
  <Typography variant="h6" color="primary">
    {/* Safely handle undefined price */}
    ${typeof searchResults.price === 'number' ? searchResults.price.toFixed(2) : 'N/A'}
  </Typography>
</Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {searchResults.availableDrivers.map((driver) => (
                <Box key={driver.id}>
                  <StyledCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6">
                              {driver.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CarIcon color="primary" />
                            <Typography variant="body1">
                              {driver.vehicle.model} • {driver.vehicle.color} • {driver.vehicle.plateNumber}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={driver.rating}
                              precision={0.1}
                              readOnly
                              size="small"
                              icon={<StarIcon fontSize="inherit" />}
                            />
                            <Typography variant="body2" color="text.secondary">
                              ({driver.totalRides} rides)
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ flex: '0 0 200px', minWidth: 0 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Arrives in {driver.estimatedArrival}
                            </Typography>
                            <BookButton
                              variant="contained"
                              onClick={() => handleBookRide(driver)}
                              disabled={loading}
                              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                              {loading ? 'Booking...' : 'Book Now'}
                            </BookButton>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </GradientBackground>
  );
};

export default RideResults; 