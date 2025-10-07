import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Footer from '../Footer';
import Navbar from '../Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  const excludedPaths = ['/dashboard', '/login', '/register','/testimonies'];

  // Ne pas afficher le layout sur les pages exclues
  if (excludedPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Navbar />
      <Box 
        id="main-content"
        sx={{
          flex: 1,
          mt: '65px', // Pour compenser la hauteur de la navbar fixe
          py: 4,
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
