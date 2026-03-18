import React, { useEffect, useState } from 'react';
import { 
  Typography, Box, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { workflowAPI } from '../services/workflowAPI';
import { useSocket } from '../context/SocketContext';

const MotionTableRow = motion(TableRow);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowAPI.getAllWorkflows();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const socket = useSocket();

  useEffect(() => {
    fetchWorkflows();

    if (socket) {
      socket.on('workflow_updated', fetchWorkflows);
      return () => socket.off('workflow_updated', fetchWorkflows);
    }
  }, [socket]);

  const handleDeleteClick = (workflow) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;
    try {
      await workflowAPI.deleteWorkflow(workflowToDelete.id);
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
      fetchWorkflows(); // Refresh list
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWorkflowToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)' }}>
            Workflows
          </Typography>
          <Typography variant="body2" color="text.secondary">Manage your automation pipelines</Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/workflows/create')}
            component={motion.button}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            sx={{ fontWeight: 'bold' }}
          >
            Create Workflow
          </Button>
        </motion.div>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ background: 'rgba(22, 27, 44, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="workflow table">
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Workflow Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Version</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Loading workflows...</TableCell>
              </TableRow>
            ) : workflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No workflows found. Create one to get started.</TableCell>
              </TableRow>
            ) : (
              workflows.map((workflow) => (
                <MotionTableRow 
                  key={workflow.id} 
                  hover 
                  variants={itemVariants}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {workflow.name}
                  </TableCell>
                  <TableCell>v{workflow.version}</TableCell>
                  <TableCell>
                    <Chip 
                      label={workflow.status} 
                      color={workflow.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold', borderColor: workflow.status === 'Active' ? '#60a5fa' : 'divider', color: workflow.status === 'Active' ? '#60a5fa' : 'text.secondary' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Workflow">
                      <IconButton component={motion.button} whileHover={{ scale: 1.1, color: '#60a5fa' }} color="primary" onClick={() => navigate(`/workflows/${workflow.id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Steps">
                      <IconButton component={motion.button} whileHover={{ scale: 1.1, color: '#2563eb' }} color="primary" onClick={() => navigate(`/workflows/${workflow.id}/steps`)}>
                        <AccountTreeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Rules">
                      <IconButton component={motion.button} whileHover={{ scale: 1.1, color: '#93c5fd' }} color="primary" onClick={() => navigate(`/workflows/${workflow.id}/rules`)}>
                        <RuleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Execute Workflow">
                      <IconButton component={motion.button} whileHover={{ scale: 1.1, color: '#60a5fa' }} color="primary" onClick={() => navigate(`/workflows/${workflow.id}/execute`)}>
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Workflow">
                      <IconButton component={motion.button} whileHover={{ scale: 1.1, color: '#ef4444' }} color="error" onClick={() => handleDeleteClick(workflow)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </MotionTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Workflow?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{workflowToDelete?.name}</strong>? 
            This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowList;
