import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, 
  Badge, Menu, MenuItem, List, ListItemText, 
  Divider, Button, ListItemAvatar, Snackbar, Alert 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const MotionIconButton = motion(IconButton);

const Navbar = () => {
  const { notifications, unreadCount, markAsRead, clearAll, latestNotification, clearLatest } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
    handleCloseNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error': return <Avatar sx={{ bgcolor: 'error.main', color: '#fff' }}><ErrorOutlineIcon fontSize="small" /></Avatar>;
      case 'warning': return <Avatar sx={{ bgcolor: 'warning.main', color: '#fff' }}><WarningAmberIcon fontSize="small" /></Avatar>;
      default: return <Avatar sx={{ bgcolor: 'info.main', color: '#fff' }}><InfoOutlinedIcon fontSize="small" /></Avatar>;
    }
  };

  return (
    <>
    <AppBar position="static" elevation={0} sx={{ 
      background: 'rgba(5, 5, 5, 0.7)', 
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
    }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { sm: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
            Hally<span style={{ color: '#d2e8d6ff' }}>Automation</span>
          </Typography>
        </motion.div>
        
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MotionIconButton 
            color="inherit" 
            onClick={handleOpenNotifications}
            whileHover={{ scale: 1.1, textShadow: '0px 0px 8px rgba(96, 165, 250, 0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </MotionIconButton>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontWeight: 'bold' }}>U</Avatar>
          </motion.div>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseNotifications}
          PaperProps={{
            sx: { 
              width: 320, 
              maxHeight: 400, 
              mt: 1.5,
              background: 'rgba(25, 25, 30, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
            {notifications.length > 0 && (
              <Button size="small" onClick={clearAll}>Clear all</Button>
            )}
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <MenuItem disabled sx={{ py: 2, justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">No new notifications</Typography>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{ 
                    whiteSpace: 'normal', 
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1.5
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 48 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </Typography>
                        {notification.message}
                      </>
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: notification.read ? 'normal' : 'bold' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </MenuItem>
              ))
            )}
          </List>
        </Menu>
      </Toolbar>
    </AppBar>

    <Snackbar
      open={Boolean(latestNotification)}
      autoHideDuration={4000}
      onClose={clearLatest}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 7 }}
    >
      <Alert 
        onClose={clearLatest} 
        severity={latestNotification?.type || 'info'} 
        variant="filled"
        sx={{ width: '100%', boxShadow: 3 }}
      >
        <Typography variant="subtitle2" fontWeight="bold">{latestNotification?.title}</Typography>
        <Typography variant="body2">{latestNotification?.message}</Typography>
      </Alert>
    </Snackbar>
    </>
  );
};

export default Navbar;
