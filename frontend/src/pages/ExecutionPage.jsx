import React, { useState } from 'react';
import {
  Typography, Box, TextField, Button, Paper, Grid,
  LinearProgress, Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExecutionLog from '../components/ExecutionLog';
import { executionAPI } from '../services/executionAPI';
import { useNotifications } from '../context/NotificationContext';

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

        // Add notification for the step completion
        if (step.error_message) {
          addNotification({
            title: `Rule Error: ${step.step_name || step.step}`,
            message: `Condition "${step.rule_evaluated}" failed with error: ${step.error_message}`,
            type: 'error'
          });
        } else if (step.result === 'FALSE/DEFAULT') {
          addNotification({
            title: `No Match: ${step.step_name || step.step}`,
            message: `Evaluation: "${step.rule_evaluated}". Result: No rules matched. using default path.`,
            type: 'warning'
          });
        } else {
          addNotification({
            title: `Step Processed: ${step.step_name || step.step}`,
            message: `Matched Condition: "${step.rule_evaluated}". Successfully moved to the next step.`,
            type: 'info'
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
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Execute Workflow
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Workflow Inputs</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={inputs.amount}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="e.g., 150"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Country"
              name="country"
              value={inputs.country}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder='e.g., US'
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Priority"
              name="priority"
              value={inputs.priority}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="e.g., high"
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={executing}
            >
              {executing ? 'Running...' : 'Run Workflow'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {executing && (
        <Box sx={{ mt: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      )}

      {allStepsCompleted && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Workflow executed successfully!
        </Alert>
      )}

      {progressSteps.length > 0 && (
        <ExecutionLog
          steps={progressSteps}
          executionId={executionResult?.id}
        />
      )}
    </Box>
  );
};

export default ExecutionPage;
