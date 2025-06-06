import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Typography,
  Container,
  useTheme,
  alpha,
  Card,
  CardContent,
  Grid,
  IconButton,
  useMediaQuery,
  Button,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  DirectionsCar as CarIcon,
  LocalParking as ParkingIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  paddingBottom: '80px',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  '& .MuiBottomNavigationAction-root': {
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      '& .MuiSvgIcon-root': {
        transform: 'scale(1.2)',
      },
    },
    '& .MuiSvgIcon-root': {
      transition: 'transform 0.2s ease-in-out',
    },
  },
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  gap: theme.spacing(2),
  width: '100%',
}));

const GridItem = styled(Box)(({ theme }) => ({
  gridColumn: 'span 12',
  [theme.breakpoints.up('sm')]: {
    '&.half': {
      gridColumn: 'span 6',
    },
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '200px',
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, 
      ${alpha(theme.palette.primary.main, 0.7)}, 
      ${alpha(theme.palette.secondary.main, 0.7)})`,
    zIndex: 1,
  },
}));

const HeroImage = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(1px)',
  transform: 'scale(1.1)',
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
  color: theme.palette.common.white,
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%',
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  borderRadius: theme.spacing(1),
  backdropFilter: 'blur(8px)',
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  '& .number': {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: theme.spacing(-1.0),
    marginTop: -8,
  },
  '& .label': {
    fontSize: '0.875rem',
    opacity: 0.9,
  },
}));

const ServiceCard = ({ icon: Icon, title, description, onClick }: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <StyledCard onClick={onClick}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '12px',
                p: 1,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (!user) {
      navigate('/login', { state: { from: { pathname: getPathFromValue(newValue) } } });
      return;
    }
    switch (newValue) {
      case 0:
        navigate('/rides/search');
        break;
      case 1:
        navigate('/parking/search');
        break;
      case 2:
        navigate('/rides/history');
        break;
      case 3:
        navigate('/parking/history');
        break;
      case 4:
        navigate('/profile');
        break;
    }
  };

  const getPathFromValue = (value: number): string => {
    switch (value) {
      case 0: return '/rides/search';
      case 1: return '/parking/search';
      case 2: return '/rides/history';
      case 3: return '/parking/history';
      case 4: return '/profile';
      default: return '/';
    }
  };

  const handleServiceClick = (path: string) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: path } } });
      return;
    }
    navigate(path);
  };

  const services = [
    {
      icon: CarIcon,
      title: 'Find a Ride',
      description: 'Search and book rides to your destination',
      onClick: () => handleServiceClick('/rides/search'),
    },
    {
      icon: ParkingIcon,
      title: 'Find Parking',
      description: 'Locate and reserve parking spots nearby',
      onClick: () => handleServiceClick('/parking/search'),
    },
    {
      icon: HistoryIcon,
      title: 'Ride History',
      description: 'View all your rides',
      onClick: () => handleServiceClick('/rides/history'),
    },
    {
      icon: ParkingIcon,
      title: 'Parking History',
      description: 'View your past parking sessions',
      onClick: () => handleServiceClick('/parking/history'),
    },
  ];

  const stats = [
    { number: '1.2K+', label: 'Active Users' },
    { number: '500+', label: 'Parking Spots' },
    { number: '2.5K+', label: 'Rides Daily' },
  ];

  return (
    <GradientBackground>
      <Container maxWidth="sm" sx={{ background: 'transparent', p: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ pt: 4, pb: 2 }}>
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
                textAlign: 'center',
              }}
            >
              {user ? `Welcome back, ${user.name}!` : 'Welcome to Park & Ride'}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                textAlign: 'center',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              {user 
                ? 'Your one-stop solution for seamless parking and rides'
                : 'Sign in to access all features and start your journey'}
            </Typography>

            {!user && (
              <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/signup')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderWidth: 2,
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HeroSection>
                <HeroImage />
                <HeroContent>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Smart Parking & Rides
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    {user 
                      ? 'Find parking spots and book rides instantly'
                      : 'Join us to experience seamless parking and ride services'}
                  </Typography>
                  <StatsContainer>
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      >
                        <StatItem>
                          <Typography className="number">{stat.number}</Typography>
                          <Typography className="label">{stat.label}</Typography>
                        </StatItem>
                      </motion.div>
                    ))}
                  </StatsContainer>
                </HeroContent>
              </HeroSection>
            </motion.div>

            <Box sx={{ mb: 4, mt: 6 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {user ? 'Choose Your Service' : 'Our Services'}
              </Typography>
              <GridContainer>
                {services.map((service, index) => (
                  <GridItem className="half" key={service.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    >
                      <ServiceCard {...service} />
                    </motion.div>
                  </GridItem>
                ))}
              </GridContainer>
            </Box>

            {isMobile && user && (
              <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
                <StyledBottomNavigation
                  value={value}
                  onChange={handleChange}
                  showLabels
                >
                  <BottomNavigationAction
                    label="Ride"
                    icon={<CarIcon />}
                  />
                  <BottomNavigationAction
                    label="Parking"
                    icon={<ParkingIcon />}
                  />
                  <BottomNavigationAction
                    label="Rides"
                    icon={<HistoryIcon />}
                  />
                  <BottomNavigationAction
                    label="Parking"
                    icon={<ParkingIcon />}
                  />
                </StyledBottomNavigation>
              </Box>
            )}
          </Box>
        </motion.div>
      </Container>
    </GradientBackground>
  );
};

export default Home; 