import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, Paper, Grid, 
  IconButton, MenuItem, Select, FormControl, InputLabel, Divider 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
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

  if (loading) return <Typography p={3}>Loading...</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {isEditing ? 'Edit Workflow' : 'Create Workflow'}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
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
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Input Schema</Typography>
              <Button 
                startIcon={<AddCircleOutlineIcon />} 
                onClick={handleAddField}
                variant="outlined"
                size="small"
              >
                Add Field
              </Button>
            </Box>

            {formData.inputSchema.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                No input fields defined.
              </Typography>
            ) : (
              formData.inputSchema.map((field, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
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
                    <IconButton color="error" onClick={() => handleRemoveField(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))
            )}
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
