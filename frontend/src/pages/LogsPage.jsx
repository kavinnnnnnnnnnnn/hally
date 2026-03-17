import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { executionAPI } from '../services/executionAPI';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const MotionTableRow = motion(TableRow);

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await executionAPI.getLogs();
        setLogs(Array.isArray(data.rows) ? data.rows : []);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const s = status.toUpperCase();
    if (s === 'COMPLETED') return 'success';
    if (s === 'FAILED' || s === 'ERROR') return 'error';
    if (s === 'RUNNING' || s === 'RETRYING') return 'info';
    return 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)', mb: 1 }}>
          Execution Logs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Historical record of all workflow runs
        </Typography>
      </motion.div>

      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
          background: 'rgba(22, 27, 44, 0.65)', 
          backdropFilter: 'blur(10px)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: 2 
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="execution logs table">
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Execution ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Workflow Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Triggered By</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Error Message</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Loading logs...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No execution logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <MotionTableRow 
                  key={log.id} 
                  hover 
                  variants={rowVariants}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.05)' }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.light' }}>
                      {log.id.substring(0, 8)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{log.Workflow?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      color={getStatusColor(log.status)}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 'bold', px: 1 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{log.triggered_by || 'System'}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: log.error_message ? 'error.main' : 'text.secondary', 
                        maxWidth: 200, 
                        display: 'block', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {log.error_message || '--'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </MotionTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogsPage;
