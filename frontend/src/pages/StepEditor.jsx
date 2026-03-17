import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert, Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import StepCard from '../components/StepCard';
import { stepAPI } from '../services/stepAPI';

const stepTypes = ['task', 'approval', 'notification'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StepEditor = () => {
  const { id: workflowId } = useParams();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [formData, setFormData] = useState({ name: '', step_type: 'task' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchSteps = async () => {
    try {
      const data = await stepAPI.getStepsByWorkflow(workflowId);
      setSteps(Array.isArray(data) ? data.filter(s => s && s.id) : []);
    } catch (err) {
      console.error('Failed to fetch steps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteps();
  }, [workflowId]);

  const handleOpenDialog = (step = null) => {
    if (step) {
      setEditingStep(step);
      setFormData({ name: step.name || '', step_type: step.step_type || 'task' });
    } else {
      setEditingStep(null);
      setFormData({ name: '', step_type: 'task' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStep(null);
    setFormData({ name: '', step_type: 'task' });
  };

  const handleSave = async () => {
    try {
      const trimmedName = (formData.name || '').trim();
      if (!trimmedName) return;

      if (editingStep) {
        await stepAPI.updateStep(workflowId, editingStep.id, { ...formData, name: trimmedName });
        setSnackbar({ open: true, message: 'Step updated successfully!', severity: 'success' });
      } else {
        await stepAPI.createStep(workflowId, { ...formData, name: trimmedName });
        setSnackbar({ open: true, message: 'Step added successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchSteps();
    } catch (err) {
      console.error('Failed to save step:', err);
      setSnackbar({ 
        open: true, 
        message: `Failed to save step: ${err.response?.data?.error || err.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (stepId) => {
    try {
      await stepAPI.deleteStep(workflowId, stepId);
      setSnackbar({ open: true, message: 'Step deleted successfully!', severity: 'success' });
      fetchSteps();
    } catch (err) {
      console.error('Failed to delete step:', err);
      setSnackbar({ 
        open: true, 
        message: `Failed to delete step: ${err.response?.data?.error || err.message}`, 
        severity: 'error' 
      });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)' }}>
            Workflow Steps
          </Typography>
          <Typography variant="body2" color="text.secondary">Configure sequential actions for your process</Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
            component={motion.button}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            Add Step
          </Button>
        </motion.div>
      </Box>

      {loading ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>Loading steps...</Typography>
      ) : steps.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(22, 27, 44, 0.4)', borderRadius: 4, border: '1px dashed rgba(96, 165, 250, 0.2)' }}>
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No steps defined for this workflow. Click "Add Step" to begin.
          </Typography>
        </Paper>
      ) : (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {steps.map((step, index) => (
              <motion.div key={step.id} variants={itemVariants} exit={{ opacity: 0, x: -20 }}>
                <StepCard
                  step={step}
                  index={index}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* Add / Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(22, 27, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: '#60a5fa', fontWeight: 'bold' }}>{editingStep ? 'Edit Step' : 'Add Step'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            label="Step Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            sx={{ mb: 3 }}
            variant="outlined"
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Step Type</InputLabel>
            <Select
              value={formData.step_type}
              label="Step Type"
              onChange={(e) => setFormData(prev => ({ ...prev, step_type: e.target.value }))}
            >
              {stepTypes.map(t => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.name.trim()}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            {editingStep ? 'Update' : 'Add Step'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StepEditor;
