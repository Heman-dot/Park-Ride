import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  DirectionsCar as CarIcon,
  LocalParking as ParkingIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const MenuCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.spacing(1.5),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    background: alpha(theme.palette.primary.main, 0.05),
  },
}));

const NavigationMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const menuItems = [
    {
      title: 'Find a Ride',
      icon: <CarIcon />,
      path: '/rides/search',
      description: 'Search for available rides',
    },
    {
      title: 'Find Parking',
      icon: <ParkingIcon />,
      path: '/parking/search',
      description: 'Search for parking spots',
    },
    {
      title: 'Ride History',
      icon: <HistoryIcon />,
      path: '/rides/history',
      description: 'View your ride history',
    },
    {
      title: 'Parking History',
      icon: <ParkingIcon />,
      path: '/parking/history',
      description: 'View your parking history',
    },
    {
      title: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
      description: 'Manage your profile',
    },
  ];

  return (
    <>
      <IconButton
        edge="start"
        color="primary"
        aria-label="menu"
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <StyledDrawer
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {user ? `Welcome, ${user.name}` : 'Menu'}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {menuItems.map((item) => (
            <MenuCard key={item.path} onClick={() => handleNavigation(item.path)}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </MenuCard>
          ))}
        </Box>
      </StyledDrawer>
    </>
  );
};

export default NavigationMenu; 