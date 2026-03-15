import React from 'react';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            <AppRoutes />
          </Box>
          <Footer />
        </Box>
      </Box>
    </NotificationProvider>
  );
}

export default App;
