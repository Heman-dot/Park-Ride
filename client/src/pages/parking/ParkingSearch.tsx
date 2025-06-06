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
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  AccessTime as TimeIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';

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

const SearchButton = styled(Button)(({ theme }) => ({
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

const ParkingSearch: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    setError(null);
    
    // Validate inputs
    if (!location || !duration || !vehicleType) {
      setError('Please fill in all fields');
      return;
    }

    // For our seeded data, we'll use Delhi coordinates
    // In a real app, this would use a geocoding service
    const delhiCoordinates = {
      latitude: 28.6139,
      longitude: 77.2090
    };

    // Validate duration
    const durationHours = parseInt(duration);
    if (isNaN(durationHours) || durationHours <= 0) {
      setError('Please select a valid duration');
      return;
    }

    // Navigate to results with search parameters
    navigate('/parking/results', {
      state: {
        coordinates: delhiCoordinates,
        duration: durationHours,
        vehicleType,
        searchLocation: location // Pass the searched location for display
      },
    });
  };

  const durations = [
    { value: '1', label: '1 hour' },
    { value: '2', label: '2 hours' },
    { value: '4', label: '4 hours' },
    { value: '8', label: '8 hours' },
    { value: '24', label: '24 hours' },
  ];

  const vehicleTypes = [
    { value: 'Sedan', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Van', label: 'Van' },
    { value: 'Motorcycle', label: 'Motorcycle' },
  ];

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
              Find Parking
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <StyledPaper>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StyledTextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location (e.g., Delhi)"
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
                  label="Duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {durations.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </StyledTextField>

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
                  disabled={!location || !duration || !vehicleType}
                  startIcon={<SearchIcon />}
                  sx={{ mt: 2 }}
                >
                  Search Parking
                </SearchButton>
              </Box>
            </StyledPaper>
          </Box>
        </motion.div>
      </Container>
    </GradientBackground>
  );
};

export default ParkingSearch; 