import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  LocationOn as LocationIcon,
  SwapHoriz as SwapIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import rideService from '../../services/rideService';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiInputAdornment-root': {
    color: theme.palette.primary.main,
  },
}));

const SwapButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  transition: 'all 0.3s ease',
}));

const SearchButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: "#fff !important",
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '&:hover': {
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const RideSearch: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleTypes = [
    { value: 'Sedan', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Luxury', label: 'Luxury' },
    { value: 'Van', label: 'Van' },
  ];

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchResults = await rideService.searchRides({
        vehicleType,
      });

      navigate('/rides/results', {
        state: {
          searchResults,
          from: fromLocation,
          to: toLocation,
          vehicleType,
        }
      });
    } catch (err: any) {
      console.error('Error searching rides:', err);
      setError(err.response?.data?.message || 'Failed to search rides. Please try again.');
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
              Find Your Ride
            </Typography>

            <StyledPaper>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StyledTextField
                  fullWidth
                  label="From"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="Enter pickup location"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <SwapButton onClick={handleSwap}>
                    <SwapIcon />
                  </SwapButton>
                </Box>

                <StyledTextField
                  fullWidth
                  label="To"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="Enter destination"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  select
                  fullWidth
                  label="Vehicle Type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CarIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {vehicleTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </StyledTextField>

                <SearchButton
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!fromLocation || !toLocation || !vehicleType || loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Searching...' : 'Search Rides'}
                </SearchButton>
              </Box>
            </StyledPaper>
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
    </GradientBackground>
  );
};

export default RideSearch; 