import React, { useState } from 'react';
import {
  Typography, Box, TextField, Button, Paper, Grid,
  LinearProgress, Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExecutionLog from '../components/ExecutionLog';
import { executionAPI } from '../services/executionAPI';
import { useNotifications } from '../context/NotificationContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const ExecutionPage = () => {
  const { id: workflowId } = useParams();
  const { addNotification } = useNotifications();

  const [inputs, setInputs] = useState({
    amount: '',
    country: '',
    priority: '',
  });

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleRun = async () => {
    setExecuting(true);
    setError(null);
    setProgressSteps([]);
    setExecutionResult(null);

    try {
      const result = await executionAPI.runWorkflow(workflowId, inputs);
      setExecutionResult(result);

      const steps = result.steps || result.logs || [];
      
      // Simulate step-by-step progress with delays
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgressSteps(prev => [...prev, step]);

        const ruleLog = (() => {
          try { return JSON.parse(step.rule_evaluated); } catch { return null; }
        })();

        const destStepName = ruleLog?.next_step_name || null;
        const rulesSummary = ruleLog?.evaluated_rules
          ? ruleLog.evaluated_rules.map(r => `"${r.rule}" → ${r.result}`).join(' | ')
          : step.rule_evaluated;

        if (step.result === 'ERROR' || step.error_message) {
          addNotification({
            title: `⚠️ Rule Evaluation Error`,
            message: `Step "${step.step_name}" — ${step.error_message || 'Unknown error'}`,
            type: 'error'
          });
        } else if (step.result === 'NO_MATCH') {
          addNotification({
            title: `❌ No Rule Matched`,
            message: `Step "${step.step_name}" — No rule matched and no DEFAULT rule exists. Execution stopped.`,
            type: 'error'
          });
        } else if (step.result === 'ENDPOINT') {
          addNotification({
            title: step.step_name,
            message: `Step "${step.step_name}" completed. Workflow finished.`,
            type: 'success'
          });
        } else if (step.result === 'DEFAULT') {
          addNotification({
            title: destStepName || 'Task Rejection',
            message: `Conditions not fully met in "${step.step_name}". Rules: ${rulesSummary}`,
            type: 'warning'
          });
        } else {
          addNotification({
            title: destStepName || step.step_name,
            message: `Conditions met in "${step.step_name}". Rules: ${rulesSummary}`,
            type: 'success'
          });
        }
      }
    } catch (err) {
      console.error('Execution failed:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Workflow execution failed. Please try again.';
      setError(errorMsg);
    } finally {
      setExecuting(false);
    }
  };

  const allStepsCompleted = progressSteps.length > 0 &&
    progressSteps[progressSteps.length - 1]?.status === 'completed';

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.3)', textAlign: 'center', mb: 4 }}>
          Execute Workflow
        </Typography>

        <Paper 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
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
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Workflow Inputs</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={inputs.amount}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., 150"
                sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(4px)' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
              <TextField
                label="Country"
                name="country"
                value={inputs.country}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder='e.g., US'
                sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(4px)' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
              <TextField
                label="Priority"
                name="priority"
                value={inputs.priority}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., high"
                sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(4px)' } }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }} component={motion.div} variants={itemVariants}>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleRun}
                disabled={executing}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
              >
                {executing ? 'Running...' : 'Run Workflow'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      <AnimatePresence>
        {executing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            sx={{ mt: 4 }}
          >
            <Box sx={{ mt: 4 }}>
              <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} sx={{ mt: 4 }}>
            <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>{error}</Alert>
          </motion.div>
        )}

        {allStepsCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} sx={{ mt: 4 }}>
            <Alert severity="success" sx={{ mt: 4, borderRadius: 2 }}>
              Workflow executed successfully!
            </Alert>
          </motion.div>
        )}

        {progressSteps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Box sx={{ mt: 4 }}>
              <ExecutionLog
                steps={progressSteps}
                executionId={executionResult?.id}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ExecutionPage;
