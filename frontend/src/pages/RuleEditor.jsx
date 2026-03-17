import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import RuleForm from '../components/RuleForm';
import { ruleAPI } from '../services/ruleAPI';

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

const RuleEditor = () => {
  const { id: workflowId } = useParams();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({ condition: '', priority: 1, nextStep: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
        setSnackbar({ open: true, message: 'Rule updated successfully!', severity: 'success' });
      } else {
        await ruleAPI.createRule(workflowId, formData);
        setSnackbar({ open: true, message: 'Rule added successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchRules();
    } catch (err) {
      console.error('Failed to save rule:', err);
      setSnackbar({ 
        open: true, 
        message: `Failed to save rule: ${err.response?.data?.error || err.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (ruleId) => {
    try {
      await ruleAPI.deleteRule(workflowId, ruleId);
      setSnackbar({ open: true, message: 'Rule deleted successfully!', severity: 'success' });
      fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)' }}>
            Workflow Rules
          </Typography>
          <Typography variant="body2" color="text.secondary">Define logic branching for this pipeline</Typography>
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
            Add Rule
          </Button>
        </motion.div>
      </Box>

      {loading ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>Loading rules...</Typography>
      ) : rules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(22, 27, 44, 0.4)', borderRadius: 4, border: '1px dashed rgba(96, 165, 250, 0.2)' }}>
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No rules defined for this workflow. Click "Add Rule" to begin.
          </Typography>
        </Paper>
      ) : (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {rules.map((rule, index) => (
              <motion.div key={rule.id} variants={itemVariants} exit={{ opacity: 0, x: -20 }}>
                <RuleForm
                  rule={rule}
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
        <DialogTitle sx={{ color: '#60a5fa', fontWeight: 'bold' }}>{editingRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
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
            variant="outlined"
          />
          <TextField
            label="Priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
            fullWidth
            sx={{ mb: 3 }}
            inputProps={{ min: 1 }}
            variant="outlined"
          />
          <TextField
            label="Next Step"
            value={formData.nextStep}
            onChange={(e) => setFormData(prev => ({ ...prev, nextStep: e.target.value }))}
            fullWidth
            placeholder="e.g., Manager Approval"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!(formData.condition || '').trim()}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            {editingRule ? 'Update Rule' : 'Add Rule'}
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

export default RuleEditor;
