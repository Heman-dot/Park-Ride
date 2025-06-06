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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
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
  CheckCircle as CheckIcon,
  Directions as SeatIcon,
} from '@mui/icons-material';
import parkingService, { ParkingLocation, ParkingSlot } from '../../services/parkingService';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  padding: theme.spacing(2),
}));

const ParkingSlotCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
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

const SlotGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const SlotItem = styled(Box)(({ theme }) => ({
  aspectRatio: '1',
}));

const SlotButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'available' && prop !== 'selected' && prop !== 'isBooked',
})<{ available: boolean; selected: boolean; isBooked: boolean }>(({ theme, available, selected, isBooked }) => ({
  width: '100%',
  height: '100%',
  minWidth: 'unset',
  padding: 0,
  borderRadius: theme.spacing(1),
  backgroundColor: selected
    ? theme.palette.primary.main
    : isBooked
    ? alpha(theme.palette.error.main, 0.2)
    : available
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.error.main, 0.1),
  color: selected
    ? theme.palette.primary.contrastText
    : isBooked
    ? theme.palette.error.main
    : available
    ? theme.palette.success.main
    : theme.palette.error.main,
  border: `2px solid ${
    selected
      ? theme.palette.primary.main
      : isBooked
      ? theme.palette.error.main
      : available
      ? theme.palette.success.main
      : theme.palette.error.main
  }`,
  '&:hover': {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : isBooked
      ? alpha(theme.palette.error.main, 0.3)
      : available
      ? alpha(theme.palette.success.main, 0.2)
      : alpha(theme.palette.error.main, 0.2),
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
  },
}));

const ParkingSlots: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { parkingId, coordinates, duration, vehicleType } = location.state as {
    parkingId: string;
    coordinates: { latitude: number; longitude: number };
    duration: number;
    vehicleType: string;
  };

  const [parkingInfo, setParkingInfo] = useState<ParkingLocation | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const hasActiveBookingAtLocation = (): boolean => {
    return slots.some(slot => 
      slot.bookings.some(booking => 
        booking.userId === localStorage.getItem('userId') && 
        ['upcoming', 'active'].includes(booking.status)
      )
    );
  };

  const isSlotAvailable = (slot: ParkingSlot): boolean => {
    // If user already has an active booking at this location, no slots are available
    if (hasActiveBookingAtLocation()) {
      return false;
    }

    // Check if slot is marked as unavailable
    if (!slot.available) return false;

    return true;
  };

  const isSlotBooked = (slot: ParkingSlot): boolean => {
    return slot.bookings.some(booking => 
      ['upcoming', 'active'].includes(booking.status)
    );
  };

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch parking location details
        const parking = await parkingService.getParkingDetails(parkingId);

        if (!parking) {
          throw new Error('Parking location not found');
        }

        // Check if user already has an active booking at this location
        const hasBooking = parking.slots.some(slot => 
          slot.bookings.some(booking => 
            booking.userId === localStorage.getItem('userId') && 
            ['upcoming', 'active'].includes(booking.status)
          )
        );

        if (hasBooking) {
          setError('You already have an active booking at this location. Please complete or cancel it first.');
          // Disable all slots if user has an active booking
          const updatedSlots = parking.slots.map(slot => ({
            ...slot,
            available: false
          }));
          setSlots(updatedSlots);
        } else {
          // Update slots with availability status
          const updatedSlots = parking.slots.map(slot => ({
            ...slot,
            available: !isSlotBooked(slot) && isSlotAvailable(slot)
          }));
          setSlots(updatedSlots);
        }

        setParkingInfo(parking);

        // If a slot was previously selected but is no longer available, clear selection
        if (selectedSlot) {
          const slot = parking.slots.find(s => s.id === selectedSlot);
          if (!slot || !slot.available) {
            setSelectedSlot(null);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching parking data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingData();
  }, [parkingId, refreshTrigger]);

  // Add polling for real-time updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  const handleSlotSelect = (slotId: string) => {
    // Prevent slot selection if user has an active booking
    if (hasActiveBookingAtLocation()) {
      setError('You already have an active booking at this location. Please complete or cancel it first.');
      return;
    }

    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.available) return;
    
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const handleConfirm = () => {
    if (!selectedSlot || !parkingInfo) return;
    
    // Prevent booking if user has an active booking
    if (hasActiveBookingAtLocation()) {
      setError('You already have an active booking at this location. Please complete or cancel it first.');
      return;
    }
    
    // Verify slot is still available before showing confirmation
    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot || !slot.available) {
      setError('This slot is no longer available. Please select another slot.');
      setSelectedSlot(null);
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const handleBookingConfirm = async () => {
    if (!selectedSlot || !parkingInfo) return;

    // Final check to prevent booking if user has an active booking
    if (hasActiveBookingAtLocation()) {
      setError('You already have an active booking at this location. Please complete or cancel it first.');
      setShowConfirmDialog(false);
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

      // Book the slot
      const booking = await parkingService.bookSlot(parkingId, selectedSlot, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        vehicleType,
      });

      // Immediately update local state to show all slots as unavailable
      setSlots(prevSlots => 
        prevSlots.map(slot => ({
          ...slot,
          available: false,
          isBooked: slot.id === selectedSlot || isSlotBooked(slot)
        }))
      );

      // Update available slots count
      setParkingInfo(prev => prev ? {
        ...prev,
        availableSlots: 0 // Set to 0 since user can't book more slots
      } : null);

      // Navigate to history with success message
      navigate('/parking/history', {
        state: { 
          bookingId: booking._id,
          success: 'Parking slot booked successfully!'
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error booking slot. Please try again.');
      setShowConfirmDialog(false);
      
      // If the error is related to slot availability, refresh the data
      if (err.response?.data?.message?.includes('not available') || 
          err.response?.data?.message?.includes('already booked')) {
        setRefreshTrigger(prev => prev + 1);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getSlotStatus = (slot: ParkingSlot) => {
    if (hasActiveBookingAtLocation()) {
      return 'Your Booking';
    }

    if (!slot.available) {
      return 'Booked';
    }

    return 'Available';
  };

  const getSlotTooltip = (slot: ParkingSlot) => {
    if (hasActiveBookingAtLocation()) {
      return 'You already have a booking at this location';
    }

    const status = getSlotStatus(slot);
    if (status === 'Booked') {
      const booking = slot.bookings.find(b => 
        ['upcoming', 'active'].includes(b.status)
      );
      if (booking) {
        return `Booked from ${new Date(booking.startTime).toLocaleTimeString()} to ${new Date(booking.endTime).toLocaleTimeString()}`;
      }
    }
    return 'Click to select this slot';
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

  if (!parkingInfo) {
    return (
      <GradientBackground>
        <Container maxWidth="sm">
          <Alert severity="error">
            Parking location not found. Please try searching again.
          </Alert>
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
              Select Parking Slot
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
              </Box>
            ) : !parkingInfo ? (
              <Alert severity="error">
                Parking location not found. Please try searching again.
              </Alert>
            ) : (
              <ParkingSlotCard>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ParkingIcon color="primary" />
                    {parkingInfo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <LocationIcon sx={{ fontSize: '1rem' }} />
                    {parkingInfo.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <InfoChip
                    icon={<MoneyIcon />}
                    label={`$${parkingInfo.pricePerHour}/hour`}
                    size="small"
                  />
                  <InfoChip
                    icon={<CarIcon />}
                    label={`${parkingInfo.totalSlots} total spots`}
                    size="small"
                  />
                  <InfoChip
                    icon={<TimeIcon />}
                    label={`${duration} hours`}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Available Slots
            </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                      <Typography variant="caption">Available</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                      <Typography variant="caption">Booked</Typography>
                    </Box>
                  </Box>
                </Box>

                <SlotGrid>
                  {slots.map((slot) => (
                    <SlotItem key={slot.id}>
                      <Tooltip 
                        title={getSlotTooltip(slot)}
                        arrow
                        placement="top"
                      >
                        <SlotButton
                          selected={selectedSlot === slot.id}
                          available={slot.available}
                          isBooked={isSlotBooked(slot)}
                          onClick={() => handleSlotSelect(slot.id)}
                          disabled={!slot.available || bookingLoading}
                          variant="outlined"
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <SeatIcon sx={{ fontSize: '1.2rem' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {slot.number}
            </Typography>
                          </Box>
                        </SlotButton>
                      </Tooltip>
                    </SlotItem>
                  ))}
                </SlotGrid>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {parkingInfo.features.map((feature) => (
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

                <StyledButton
                  fullWidth
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={!selectedSlot || bookingLoading}
                  startIcon={bookingLoading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Parking'}
                </StyledButton>
              </ParkingSlotCard>
            )}
          </Box>
        </motion.div>
      </Container>

      <Dialog
        open={showConfirmDialog}
        onClose={() => !bookingLoading && setShowConfirmDialog(false)}
      >
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to book slot {selectedSlot} for {duration} hours?
            Total cost: ${parkingInfo?.pricePerHour ? (parkingInfo.pricePerHour * duration).toFixed(2) : '0.00'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            disabled={bookingLoading}
          >
            Cancel
          </Button>
        <Button
            onClick={handleBookingConfirm}
            disabled={bookingLoading}
          variant="contained"
          color="primary"
        >
            {bookingLoading ? 'Booking...' : 'Confirm'}
        </Button>
        </DialogActions>
      </Dialog>
    </GradientBackground>
  );
};

export default ParkingSlots; 