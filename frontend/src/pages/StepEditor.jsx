import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import StepCard from '../components/StepCard';
import { stepAPI } from '../services/stepAPI';

const stepTypes = ['task', 'approval', 'notification'];

const StepEditor = () => {
  const { id: workflowId } = useParams();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'task' });

  const fetchSteps = async () => {
    try {
      const data = await stepAPI.getStepsByWorkflow(workflowId);
      setSteps(Array.isArray(data) ? data : []);
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
      setFormData({ name: step.name, type: step.type });
    } else {
      setEditingStep(null);
      setFormData({ name: '', type: 'task' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStep(null);
    setFormData({ name: '', type: 'task' });
  };

  const handleSave = async () => {
    try {
      if (editingStep) {
        await stepAPI.updateStep(workflowId, editingStep.id, formData);
      } else {
        await stepAPI.createStep(workflowId, formData);
      }
      handleCloseDialog();
      fetchSteps();
    } catch (err) {
      console.error('Failed to save step:', err);
    }
  };

  const handleDelete = async (stepId) => {
    try {
      await stepAPI.deleteStep(workflowId, stepId);
      fetchSteps();
    } catch (err) {
      console.error('Failed to delete step:', err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Workflow Steps
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Step
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading steps...</Typography>
      ) : steps.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No steps defined for this workflow.
        </Typography>
      ) : (
        steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStep ? 'Edit Step' : 'Add Step'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            label="Step Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth>
            <InputLabel>Step Type</InputLabel>
            <Select
              value={formData.type}
              label="Step Type"
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              {stepTypes.map(t => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name.trim()}>
            {editingStep ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepEditor;
