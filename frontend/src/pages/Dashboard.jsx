import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { workflowAPI } from '../services/workflowAPI';
import ThreeDAnalytics from '../components/ThreeDAnalytics';

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

const MotionCard = motion(Card);

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalWorkflows: 0,
    successfulExecutions: 0,
    failedExecutions: 0
  });

  const [analyticsData, setAnalyticsData] = useState({
    executionHistory: [],
    failureAnalysis: []
  });

  const fetchData = async () => {
    try {
      const stats = await workflowAPI.getStats();
      setDashboardStats(stats);

      const analytics = await workflowAPI.getAnalytics();
      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds for "lively" updates
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: 'Active Workflows', value: dashboardStats.totalWorkflows, icon: <AutorenewIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Successful Executions', value: dashboardStats.successfulExecutions.toLocaleString(), icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'primary.light' }} /> },
    { title: 'Failed Executions', value: dashboardStats.failedExecutions, icon: <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} /> },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 1, color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)' }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem' }}>
          Overview of your automation systems.
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={4} key={stat.title}>
            <MotionCard
              custom={i}
              initial="hidden"
              animate="visible"
              variants={statVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 30px rgba(96,165,250,0.2)',
                borderColor: 'rgba(96, 165, 250, 0.4)'
              }}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'border-color 0.3s ease',
                border: '1px solid rgba(96, 165, 250, 0.1)'
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(96, 165, 250, 0.05)', display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: '0.025em' }}>
                    {stat.title.toUpperCase()}
                  </Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        {/* 3D Workflow Health Graph */}
        <Grid item xs={12}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '24px',
              overflow: 'visible',
              position: 'relative',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff', mb: 0.5 }}>Workflow Health</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Real-time 3D isometric performance analysis</Typography>
              </Box>

            </Box>
            
            <ThreeDAnalytics 
              completed={dashboardStats.successfulExecutions}
              notCompleted={dashboardStats.failedExecutions}
              executed={dashboardStats.successfulExecutions + dashboardStats.failedExecutions}
            />
          </MotionCard>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;
