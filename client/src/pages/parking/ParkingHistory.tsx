import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  useTheme,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  History as HistoryIcon,
  ArrowBack as BackIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import parkingService, { ParkingBooking } from '../../services/parkingService';
import { alpha } from '@mui/material/styles';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  padding: theme.spacing(2),
}));

const HistoryCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(4, 3),
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(12px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.10)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
}));

const StatusChip = styled(Chip)<{ status: 'upcoming' | 'active' | 'completed' | 'cancelled' }>(
  ({ theme, status }) => ({
    backgroundColor: 
      status === 'active' || status === 'upcoming'
        ? alpha(theme.palette.success.main, 0.1)
        : status === 'completed'
        ? alpha(theme.palette.info.main, 0.1)
        : alpha(theme.palette.error.main, 0.1),
    color:
      status === 'active' || status === 'upcoming'
        ? theme.palette.success.main
        : status === 'completed'
        ? theme.palette.info.main
        : theme.palette.error.main,
    fontWeight: 500,
  })
);

const ParkingHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [bookings, setBookings] = useState<ParkingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ParkingBooking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await parkingService.getParkingHistory();
        setBookings(history);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching parking history');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    setError(null);

    try {
      await parkingService.cancelBooking(
        selectedBooking.parkingId,
        selectedBooking.slotId,
        selectedBooking._id
      );
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === selectedBooking._id
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      setShowCancelDialog(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cancelling booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'upcoming':
        return <ScheduleIcon />;
      case 'completed':
        return <CheckIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <GradientBackground>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <Container maxWidth="lg" sx={{ background: 'transparent', p: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ pt: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  mr: 2,
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
                Parking History
              </Typography>
            </Box>

            {location.state?.success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => {}}>
                {location.state.success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <HistoryCard>
              <Table sx={{ th: { py: 2, fontWeight: 700, fontSize: 16 }, td: { py: 2, fontSize: 15 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>Slot</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                          {booking.parkingLocation?.name || 'Unknown Location'}
                        </Box>
                      </TableCell>
                      <TableCell>Slot {booking.slotId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                          {booking.vehicleType}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                      <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                      <TableCell>
                        <StatusChip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          status={booking.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {['upcoming', 'active'].includes(booking.status) && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelDialog(true);
                            }}
                            disabled={cancelLoading}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No parking history found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </HistoryCard>
          </Box>
        </motion.div>
      </Container>

      <Dialog
        open={showCancelDialog}
        onClose={() => !cancelLoading && setShowCancelDialog(false)}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your booking at {selectedBooking?.parkingLocation?.name || 'Unknown Location'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowCancelDialog(false)}
            disabled={cancelLoading}
          >
            No, Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            disabled={cancelLoading}
            variant="contained"
            color="error"
          >
            {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </GradientBackground>
  );
};

export default ParkingHistory; 