import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  IconButton,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Snackbar,
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
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Schedule as ScheduledIcon,
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

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor: {
    'pending': alpha(theme.palette.warning.main, 0.1),
    'confirmed': alpha(theme.palette.info.main, 0.1),
    'in-progress': alpha(theme.palette.primary.main, 0.1),
    'completed': alpha(theme.palette.success.main, 0.1),
    'cancelled': alpha(theme.palette.error.main, 0.1),
  }[status],
  color: {
    'pending': theme.palette.warning.main,
    'confirmed': theme.palette.info.main,
    'in-progress': theme.palette.primary.main,
    'completed': theme.palette.success.main,
    'cancelled': theme.palette.error.main,
  }[status],
  fontWeight: 600,
}));

interface Location {
  address: string;
  coordinates: number[];
}

interface Driver {
  _id: string;
  name: string;
  vehicle: {
    model: string;
    color: string;
    plateNumber: string;
  };
  rating: number;
  totalRides: number;
}

interface Ride {
  _id: string;
  from: Location;
  to: Location;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  distance: number;
  duration: number;
  bookingTime: string;
  driver?: Driver;
  completedAt?: string;
  vehicleType: string;
}

const RideHistory: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getStatusStyles = (status: string) => {
    const getBackgroundColor = () => {
  switch (status) {
        case 'pending':
          return alpha(theme.palette.warning.main, 0.1);
        case 'confirmed':
          return alpha(theme.palette.info.main, 0.1);
        case 'in-progress':
          return alpha(theme.palette.primary.main, 0.1);
    case 'completed':
          return alpha(theme.palette.success.main, 0.1);
    case 'cancelled':
          return alpha(theme.palette.error.main, 0.1);
        default:
          return alpha(theme.palette.grey[500], 0.1);
      }
    };

    const getTextColor = () => {
      switch (status) {
    case 'pending':
          return theme.palette.warning.main;
        case 'confirmed':
          return theme.palette.info.main;
        case 'in-progress':
          return theme.palette.primary.main;
        case 'completed':
          return theme.palette.success.main;
        case 'cancelled':
          return theme.palette.error.main;
    default:
          return theme.palette.grey[500];
      }
    };

    return {
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      fontWeight: 600,
    };
  };

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await rideService.getUserRides();
        setRides(response.rides);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch ride history');
      } finally {
        setLoading(false);
  }
};

    fetchRides();
  }, []);

  const handleCancelRide = async (rideId: string) => {
    try {
      setLoading(true);
      await rideService.updateRideStatus(rideId, 'cancelled');
      setRides(rides.map(ride => 
        ride._id === rideId ? { ...ride, status: 'cancelled' } : ride
      ));
      setSuccess('Ride cancelled successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
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
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
          Ride History
        </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : rides.length === 0 ? (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No rides found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your ride history will appear here once you book a ride.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/rides/search')}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: '#fff',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                  }}
                >
                  Book a Ride
                </Button>
              </Paper>
            ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rides.map((ride) => (
                  <StyledCard key={ride._id}>
              <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              Ride #{ride._id.slice(-6)}
                            </Typography>
                            <Chip
                              label={ride.status.toUpperCase()}
                              size="small"
                              sx={getStatusStyles(ride.status)}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon color="primary" />
                                <Typography variant="body1">
                                  From: {ride.from.address}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon color="primary" />
                                <Typography variant="body1">
                                  To: {ride.to.address}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CarIcon color="primary" />
                                <Typography variant="body1">
                                  {ride.vehicleType}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimeIcon color="primary" />
                                <Typography variant="body1">
                                  Booked for: {formatDate(ride.bookingTime)}
                  </Typography>
                              </Box>
                            </Box>
                          </Box>
                </Box>

                        {ride.driver && (
                          <Box sx={{ width: '100%' }}>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon color="primary" />
                                <Typography variant="body1">
                                  Driver: {ride.driver.name}
                  </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CarIcon color="primary" />
                                <Typography variant="body1">
                                  {ride.driver.vehicle.model} • {ride.driver.vehicle.color} • {ride.driver.vehicle.plateNumber}
                  </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarIcon color="primary" />
                                <Typography variant="body1">
                                  Rating: {ride.driver.rating} ({ride.driver.totalRides} rides)
                  </Typography>
                </Box>
                            </Box>
                          </Box>
                        )}

                        <Box sx={{ width: '100%' }}>
                          <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                  <Typography variant="h6" color="primary">
                    ${ride.price.toFixed(2)}
                  </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {ride.distance.toFixed(1)} km
                              </Typography>
                            </Box>
                            {ride.status === 'pending' && (
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelledIcon />}
                                onClick={() => handleCancelRide(ride._id)}
                                disabled={loading}
                              >
                                Cancel Ride
                              </Button>
                            )}
                          </Box>
                        </Box>
                </Box>
              </CardContent>
                  </StyledCard>
          ))}
        </Box>
            )}
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

export default RideHistory; 