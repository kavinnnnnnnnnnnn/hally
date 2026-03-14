import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField
} from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RuleForm from '../components/RuleForm';
import { ruleAPI } from '../services/ruleAPI';

const RuleEditor = () => {
  const { id: workflowId } = useParams();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({ condition: '', priority: 1, nextStep: '' });

  const fetchRules = async () => {
    try {
      const data = await ruleAPI.getRulesByWorkflow(workflowId);
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [workflowId]);

  const handleOpenDialog = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ condition: rule.condition, priority: rule.priority, nextStep: rule.nextStep });
    } else {
      setEditingRule(null);
      setFormData({ condition: '', priority: 1, nextStep: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRule(null);
    setFormData({ condition: '', priority: 1, nextStep: '' });
  };

  const handleSave = async () => {
    try {
      if (editingRule) {
        await ruleAPI.updateRule(workflowId, editingRule.id, formData);
      } else {
        await ruleAPI.createRule(workflowId, formData);
      }
      handleCloseDialog();
      fetchRules();
    } catch (err) {
      console.error('Failed to save rule:', err);
    }
  };

  const handleDelete = async (ruleId) => {
    try {
      await ruleAPI.deleteRule(workflowId, ruleId);
      fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Workflow Rules
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Rule
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading rules...</Typography>
      ) : rules.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No rules defined for this workflow.
        </Typography>
      ) : (
        rules.map((rule, index) => (
          <RuleForm
            key={rule.id}
            rule={rule}
            index={index}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            label="Condition"
            value={formData.condition}
            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
            fullWidth
            multiline
            rows={2}
            placeholder='e.g., amount > 100 && country == "US"'
            sx={{ mb: 3 }}
          />
          <TextField
            label="Priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
            fullWidth
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Next Step"
            value={formData.nextStep}
            onChange={(e) => setFormData(prev => ({ ...prev, nextStep: e.target.value }))}
            fullWidth
            placeholder="e.g., Manager Approval"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.condition.trim() || !formData.nextStep.trim()}
          >
            {editingRule ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RuleEditor;
