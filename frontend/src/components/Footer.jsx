import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: '#0a192f', // Deep blue like black
        color: 'white',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2">
          Made by Sriram and Vijayzz
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} halleyx. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
