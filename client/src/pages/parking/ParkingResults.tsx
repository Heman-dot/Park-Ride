import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  useTheme,
  alpha,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  LocalParking as ParkingIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  ArrowBack as BackIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import parkingService, { ParkingLocation } from '../../services/parkingService';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  padding: theme.spacing(2),
}));

const ParkingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
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

const InfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const AvailabilityChip = styled(Chip)<{ available: boolean }>(({ theme, available }) => ({
  backgroundColor: available
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.error.main, 0.1),
  color: available
    ? theme.palette.success.main
    : theme.palette.error.main,
  fontWeight: 600,
}));

const ParkingResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { coordinates, duration, vehicleType, searchLocation } = location.state as {
    coordinates: { latitude: number; longitude: number };
    duration: number;
    vehicleType: string;
    searchLocation: string;
  };

  const [parkingSpots, setParkingSpots] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        setLoading(true);
        setError(null);
        const spots = await parkingService.searchParking();
        
        // Sort spots by availability
        const sortedSpots = spots.sort((a, b) => {
          if (a.availableSlots === 0 && b.availableSlots > 0) return 1;
          if (a.availableSlots > 0 && b.availableSlots === 0) return -1;
          return 0;
        });
        
        setParkingSpots(sortedSpots);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching parking spots. Please try again.');
        if (retryCount === 0) {
          setTimeout(() => {
            setRetryCount(1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpots();
  }, [retryCount]);

  const handleParkingSelect = (parkingId: string) => {
    navigate('/parking-slots', {
      state: {
        parkingId,
        coordinates,
        duration,
        vehicleType,
      },
    });
  };

  if (loading) {
    return (
      <GradientBackground>
        <Container maxWidth="sm">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </GradientBackground>
    );
  }

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
                mb: 1,
              }}
            >
              Available Parking
            </Typography>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {searchLocation} • {duration} hours • {vehicleType}
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  retryCount === 0 && (
                    <Button color="inherit" size="small" onClick={() => setRetryCount(1)}>
                      Retry
                    </Button>
                  )
                }
              >
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
              </Box>
            ) : parkingSpots.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No parking spots found in {searchLocation}. Try searching in a different location.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {parkingSpots.map((spot, index) => (
                  <motion.div
                    key={spot._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ParkingCard onClick={() => handleParkingSelect(spot._id)}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ParkingIcon color="primary" />
                            {spot.name}
                            <StarIcon sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                            <Typography component="span" variant="body2" color="text.secondary">
                              {spot.rating.toFixed(1)}
                            </Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: '1rem' }} />
                            {spot.address}
                          </Typography>
                        </Box>
                        <AvailabilityChip
                          label={`${spot.availableSlots} spots`}
                          available={spot.availableSlots > 0}
                          size="small"
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <InfoChip
                          icon={<MoneyIcon />}
                          label={`$${spot.pricePerHour}/hour`}
                          size="small"
                        />
                        <InfoChip
                          icon={<CarIcon />}
                          label={`${spot.totalSlots} total spots`}
                          size="small"
                        />
                        <InfoChip
                          icon={<TimeIcon />}
                          label={`${duration * spot.pricePerHour} total`}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {spot.features.map((feature) => (
                          <Chip
                            key={feature}
                            label={feature}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                            }}
                          />
                        ))}
                      </Box>
                    </ParkingCard>
                  </motion.div>
                ))}
              </Box>
            )}
          </Box>
        </motion.div>
      </Container>
    </GradientBackground>
  );
};

export default ParkingResults; 