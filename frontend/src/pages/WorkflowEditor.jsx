import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, Paper, Grid, 
  IconButton, MenuItem, Select, FormControl, InputLabel, Divider,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import { workflowAPI } from '../services/workflowAPI';

const WorkflowEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // if editing
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    version: '1.0',
    inputSchema: []
  });

  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      workflowAPI.getWorkflow(id).then(data => {
        setFormData({
          name: data.name || '',
          version: data.version || '1.0',
          inputSchema: data.inputSchema || []
        });
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch workflow', err);
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      inputSchema: [...prev.inputSchema, { name: '', type: 'string' }]
    }));
  };

  const handleRemoveField = (index) => {
    setFormData(prev => ({
      ...prev,
      inputSchema: prev.inputSchema.filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (index, field, value) => {
    const updatedSchema = [...formData.inputSchema];
    updatedSchema[index][field] = value;
    setFormData(prev => ({ ...prev, inputSchema: updatedSchema }));
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await workflowAPI.updateWorkflow(id, formData);
      } else {
        await workflowAPI.createWorkflow(formData);
      }
      navigate('/workflows');
    } catch (error) {
      console.error('Failed to save workflow', error);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)', mb: 1 }}>
          {isEditing ? 'Edit Workflow' : 'Create Workflow'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {isEditing ? 'Update your automation blueprint' : 'Define a new automation process'}
        </Typography>
      </motion.div>

      <Paper 
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        elevation={0} 
        sx={{ 
          p: 4, 
          background: 'rgba(22, 27, 44, 0.65)', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(96, 165, 250, 0.1)', 
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Workflow Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Version"
              name="version"
              value={formData.version}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2, borderColor: 'rgba(96, 165, 250, 0.1)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Input Schema</Typography>
              <Button 
                startIcon={<AddCircleOutlineIcon />} 
                onClick={handleAddField}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Add Field
              </Button>
            </Box>

            <AnimatePresence>
              {formData.inputSchema.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ mb: 2, fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  No input fields defined.
                </Typography>
              ) : (
                formData.inputSchema.map((field, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                      <Grid item xs={6}>
                        <TextField
                          label="Field Name"
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                          fullWidth
                          size="small"
                          placeholder="e.g., customerId"
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={field.type}
                            label="Type"
                            onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                          >
                            <MenuItem value="string">String</MenuItem>
                            <MenuItem value="number">Number</MenuItem>
                            <MenuItem value="boolean">Boolean</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={1}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveField(index)}
                          sx={{ '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="text" color="inherit" onClick={() => navigate('/workflows')}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!formData.name.trim()}
              component={motion.button}
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              sx={{ px: 3, fontWeight: 'bold' }}
            >
              Save Workflow
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default WorkflowEditor;
