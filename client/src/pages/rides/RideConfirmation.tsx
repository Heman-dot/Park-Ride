import React from 'react';
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
  Divider,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  ArrowBack as BackIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  padding: theme.spacing(2),
}));

const ConfirmationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
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

const SuccessIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`,
  '& svg': {
    fontSize: 40,
    color: theme.palette.common.white,
  },
}));

const RideConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { rideId, from, to } = location.state as { rideId: number; from: string; to: string };

  // Mock data - replace with actual API call
  const rideDetails = {
    driver: 'John Doe',
    rating: 4.8,
    car: 'Toyota Camry',
    time: '10:30 AM',
    duration: '25 mins',
    price: '$15',
    seats: 3,
    estimatedArrival: '10:35 AM',
  };

  const handleConfirm = () => {
    // Handle ride confirmation
    navigate('/ride-history');
  };

  return (
    <GradientBackground>
      <Container maxWidth="sm">
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

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SuccessIcon>
                <CheckIcon />
              </SuccessIcon>
            </motion.div>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Ride Confirmed!
            </Typography>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Your ride is on the way
            </Typography>

            <ConfirmationCard>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Ride Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    From: {from}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    To: {to}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Driver Information
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {rideDetails.driver}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ color: 'warning.main', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {rideDetails.rating}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {rideDetails.car}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <InfoChip
                  icon={<TimeIcon />}
                  label={`Arriving at ${rideDetails.estimatedArrival}`}
                  size="small"
                />
                <InfoChip
                  icon={<CarIcon />}
                  label={`${rideDetails.seats} seats`}
                  size="small"
                />
                <InfoChip
                  icon={<MoneyIcon />}
                  label={rideDetails.price}
                  size="small"
                />
              </Box>

              <StyledButton
                fullWidth
                variant="contained"
                onClick={handleConfirm}
                startIcon={<CheckIcon />}
              >
                View Ride Status
              </StyledButton>
            </ConfirmationCard>
          </Box>
        </motion.div>
      </Container>
    </GradientBackground>
  );
};

export default RideConfirmation; 