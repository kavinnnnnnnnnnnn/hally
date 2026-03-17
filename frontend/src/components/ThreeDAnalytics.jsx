import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';

const PieSlice = ({ startAngle, endAngle, color, glow, delay, depth = 20 }) => {
  const radius = 100;
  const centerX = 150;
  const centerY = 150;

  const getCoordinates = (angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad)
    };
  };

  const start = getCoordinates(startAngle);
  const end = getCoordinates(endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  const pathData = [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');

  return (
    <g style={{ filter: `drop-shadow(0 0 10px ${glow}44)` }}>
      {/* Side Extrusion (Bottom) */}
      <motion.path
        initial={{ opacity: 0, translateY: 0 }}
        animate={{ opacity: 1, translateY: depth }}
        transition={{ delay, duration: 1 }}
        d={pathData}
        fill={color}
        style={{ filter: 'brightness(0.6)', opacity: 0.8 }}
      />
      {/* Top Face */}
      <motion.path
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay, duration: 0.8, type: 'spring' }}
        d={pathData}
        fill={color}
        style={{ 
          stroke: 'rgba(255,255,255,0.2)', 
          strokeWidth: 1,
          filter: `brightness(1.1) drop-shadow(0 0 5px ${glow}66)`
        }}
      />
    </g>
  );
};

const ThreeDAnalytics = ({ completed, notCompleted }) => {
  const total = completed + notCompleted || 1;
  const successPercent = (completed / total) * 360;
  
  const stats = [
    { label: 'Successful', value: completed, color: '#3b82f6', glow: '#3b82f6', angle: successPercent },
    { label: 'Failed', value: notCompleted, color: '#ef4444', glow: '#ef4444', angle: 360 - successPercent },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
      minHeight: '400px',
      gap: 4,
      p: 2
    }}>
      {/* 3D Pie Chart Area */}
      <Box sx={{ 
        position: 'relative', 
        width: '300px', 
        height: '300px',
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}>
        <motion.div
          animate={{ rotateY: [0, 5, 0, -5, 0], rotateX: [55, 60, 55] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
            <PieSlice startAngle={0} endAngle={successPercent} color="#3b82f6" glow="#3b82f6" delay={0.2} />
            <PieSlice startAngle={successPercent} endAngle={360} color="#ef4444" glow="#ef4444" delay={0.4} />
            
            {/* Center Glow */}
            <circle cx="150" cy="150" r="20" fill="rgba(255,255,255,0.1)" style={{ filter: 'blur(10px)' }} />
          </svg>
        </motion.div>
        
        {/* Floor Shadow */}
        <Box sx={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%) rotateX(80deg)',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 70%)',
          zIndex: -1
        }} />
      </Box>

      {/* Detail Column */}
      <Stack spacing={3} sx={{ width: { xs: '100%', md: '300px' } }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.2em' }}>
          PERFORMANCE BREAKDOWN
        </Typography>
        
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.2 }}
          >
            <Box sx={{
              p: 2.5,
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${stat.color}33`,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '4px',
                background: stat.color,
                boxShadow: `0 0 15px ${stat.glow}`
              }
            }}>
              <Box>
                <Typography variant="h3" sx={{ 
                  color: '#fff', 
                  fontWeight: 900, 
                  lineHeight: 1, 
                  mb: 0.5,
                  textShadow: `0 0 10px ${stat.glow}44`
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {stat.label.toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                <Typography sx={{ color: stat.color, fontWeight: 800, fontSize: '0.8rem' }}>
                  {Math.round((stat.value / total) * 100)}%
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}


      </Stack>
    </Box>
  );
};

export default ThreeDAnalytics;
