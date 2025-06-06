import React from 'react';
import { Box, Container } from '@mui/material';
import NavigationBar from './NavigationBar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavigationBar />
      <Container component="main" sx={{ flexGrow: 1, py: 3, pt: 8 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout; 