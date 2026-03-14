import React from 'react';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
          <AppRoutes />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
