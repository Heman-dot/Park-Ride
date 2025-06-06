import React from 'react';
import { Box, Typography, Link, IconButton, Divider } from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const Logo = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.2rem',
  borderRadius: 8,
  padding: '4px 12px',
  display: 'inline-block',
  letterSpacing: 1,
}));

const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <Box component="footer" sx={{
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.10)} 0%, ${alpha(theme.palette.secondary.main, 0.10)} 100%)`,
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
      mt: 8,
      pt: 4,
      pb: 2,
      px: { xs: 2, sm: 4, md: 8 },
      width: '100%',
      boxShadow: '0 -8px 32px rgba(25, 118, 210, 0.08)',
      borderTopLeftRadius: { xs: 3, md: 32 },
      borderTopRightRadius: { xs: 3, md: 32 },
      overflow: 'hidden',
    }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: { xs: 'flex-start', md: 'space-between' },
          alignItems: { xs: 'flex-start', md: 'flex-start' },
          gap: { xs: 4, md: 0 },
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Left: Logo and description */}
        <Box sx={{ flex: 1, minWidth: 260, mb: { xs: 2, md: 0 }, pr: { md: 4 } }}>
          <LogoBox>
            <Logo>P&R</Logo>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Park & Ride
            </Typography>
          </LogoBox>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The smart solution for parking and last-mile connectivity. Find parking spots, book shuttles, and enjoy a seamless commute.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" size="small" href="#" aria-label="Facebook" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <FacebookIcon fontSize="medium" />
            </IconButton>
            <IconButton color="primary" size="small" href="#" aria-label="Instagram" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <InstagramIcon fontSize="medium" />
            </IconButton>
            <IconButton color="primary" size="small" href="#" aria-label="Twitter" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TwitterIcon fontSize="medium" />
            </IconButton>
          </Box>
        </Box>
        {/* Center: Quick Links */}
        <Box sx={{ flex: 1, minWidth: 200, mb: { xs: 2, md: 0 }, px: { md: 4 }, textAlign: { xs: 'left', md: 'center' } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Quick Links
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { md: 'center' } }}>
            <Link href="/parking/search" color="primary" underline="hover">Find Parking</Link>
            <Link href="#" color="primary" underline="hover">Book Shuttle</Link>
            <Link href="/rides/history" color="primary" underline="hover">My Bookings</Link>
            <Link href="#" color="primary" underline="hover">Favorites</Link>
            <Link href="#" color="primary" underline="hover">Help Center</Link>
          </Box>
        </Box>
        {/* Right: Contact Info */}
        <Box sx={{ flex: 1, minWidth: 240, pl: { md: 4 }, textAlign: { xs: 'left', md: 'right' } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1234 Parking Avenue<br />
            San Francisco, CA 94103<br />
            support@parkandride.com<br />
            (555) 123-4567
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 3, borderColor: alpha(theme.palette.primary.main, 0.08) }} />
      <Box sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        © {new Date().getFullYear()} Park & Ride. All rights reserved.
      </Box>
    </Box>
  );
};

export default Footer; 