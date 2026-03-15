import React, { useEffect, useState } from 'react';
import { 
  Typography, Box, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Chip 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import { workflowAPI } from '../services/workflowAPI';

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await workflowAPI.getAllWorkflows();
        setWorkflows(data.workflows || []);
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Workflows</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/workflows/create')}
        >
          Create Workflow
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }} aria-label="workflow table">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Workflow Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : workflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No workflows found.</TableCell>
              </TableRow>
            ) : (
              workflows.map((workflow) => (
                <TableRow key={workflow.id} hover>
                  <TableCell component="th" scope="row">
                    {workflow.name}
                  </TableCell>
                  <TableCell>{workflow.version}</TableCell>
                  <TableCell>
                    <Chip 
                      label={workflow.status} 
                      color={workflow.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Workflow">
                      <IconButton color="primary" onClick={() => navigate(`/workflows/${workflow.id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Steps">
                      <IconButton color="info" onClick={() => navigate(`/workflows/${workflow.id}/steps`)}>
                        <AccountTreeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Rules">
                      <IconButton color="secondary" onClick={() => navigate(`/workflows/${workflow.id}/rules`)}>
                        <RuleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Execute Workflow">
                      <IconButton color="success" onClick={() => navigate(`/workflows/${workflow.id}/execute`)}>
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
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

export default WorkflowList;
