import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Avatar, useTheme, alpha, styled } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const StyledProfileButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 1),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
  },
  transition: 'all 0.2s ease-in-out',
}));

const ProfileButton: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  if (!user) return null;

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <StyledProfileButton
      onClick={handleClick}
      size="large"
      sx={{
        '& .MuiAvatar-root': {
          width: 32,
          height: 32,
          backgroundColor: theme.palette.primary.main,
        },
      }}
    >
      <Avatar src={user.avatar}>
        {user.name[0]}
      </Avatar>
    </StyledProfileButton>
  );
};

export default ProfileButton; 