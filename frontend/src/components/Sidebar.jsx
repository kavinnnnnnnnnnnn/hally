import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Drawer, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Workflows', icon: <AccountTreeIcon />, path: '/workflows' },
    { text: 'Logs', icon: <ListAltIcon />, path: '/logs' },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 65,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 65,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box sx={{ p: open ? 2 : 1, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', minHeight: 64 }}>
        {open && (
          <Box 
            component="img"
            src="https://www.halleyx.com/img/halleyx-logo-line-black.05c516d1.svg"
            alt="HalleyX Logo"
            sx={{ height: 28, maxWidth: '140px', objectFit: 'contain' }}
          />
        )}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <ListItem 
              button 
              component={motion.div}
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => navigate(item.path)}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                mb: 1,
                mx: 1,
                borderRadius: 2, // Use theme or explicit rounded corners
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2.5 : 1,
                transition: 'all 0.2s ease',
                '&.Mui-selected': { 
                  bgcolor: 'rgba(96, 165, 250, 0.15)', // Sky Blue tint
                  color: 'primary.main', 
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.25)' }
                },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center', color: location.pathname.startsWith(item.path) ? 'inherit' : 'text.secondary', transition: 'all 0.2s ease' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, display: open ? 'block' : 'none', transition: 'opacity 0.2s ease' }} primaryTypographyProps={{ fontWeight: location.pathname.startsWith(item.path) ? 'bold' : 'normal' }} />
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
