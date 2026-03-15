import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { executionAPI } from '../services/executionAPI';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await executionAPI.getLogs();
        // Backend returns { count, rows }
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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Execution Logs
      </Typography>

      <TableContainer component={Paper} elevation={2} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label="execution logs table">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Execution ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Workflow Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Triggered By</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Error Message</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Approver ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No execution logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {log.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{log.Workflow?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      color={getStatusColor(log.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.triggered_by || 'System'}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: log.error_message ? 'error.main' : 'text.secondary', maxWidth: 200, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.error_message || '--'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {log.approver_id ? log.approver_id.substring(0, 8) : '--'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogsPage;
