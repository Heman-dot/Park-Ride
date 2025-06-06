import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  useTheme,
  alpha,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  padding: theme.spacing(2),
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  marginBottom: theme.spacing(2),
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

const LogoutButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.error.main,
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.2),
  },
}));

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, updateProfile, logout: authLogout, error: authError, changePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
      setOpenPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    // TODO: Implement notification preferences update
  };

  const formatLocation = (location: any) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.coordinates) {
      return `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`;
    }
    return '';
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
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
                mb: 3,
              }}
            >
              Profile
            </Typography>

            {(error || authError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || authError}
              </Alert>
            )}

            <ProfileCard>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <StyledAvatar src={user.avatar} alt={user.name}>
                  {user.name[0]}
                </StyledAvatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        sx={{ flex: 1 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            location: user.location || '',
                          });
                        }}
                        disabled={loading}
                        sx={{ flex: 1 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </form>
              ) : (
                <>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={user.email || ''}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={user.phoneNumber || ''}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    {user.location && (
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Location"
                          secondary={formatLocation(user.location)}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Notifications"
                        secondary="Receive updates about your bookings"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Switch
                        edge="end"
                        checked={notifications}
                        onChange={handleToggleNotifications}
                        color="primary"
                      />
                    </ListItem>
                    <ListItem
                      component="div"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setOpenPasswordDialog(true)}
                    >
                      <ListItemIcon>
                        <SecurityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Change Password"
                        secondary="Update your password"
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <IconButton edge="end" color="primary">
                        <EditIcon />
                      </IconButton>
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                      startIcon={<EditIcon />}
                    >
                      Edit Profile
                    </Button>
                    <LogoutButton
                      fullWidth
                      variant="contained"
                      onClick={handleLogout}
                      startIcon={<LogoutIcon />}
                    >
                      Logout
                    </LogoutButton>
                  </Box>
                </>
              )}
            </ProfileCard>
          </Box>
        </motion.div>
      </Container>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <StyledButton
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Password'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </GradientBackground>
  );
};

export default Profile; 