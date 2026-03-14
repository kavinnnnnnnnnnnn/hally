import { useState, useCallback } from 'react';
import { executionAPI } from '../services/executionAPI';

const useExecution = () => {
  const [logs, setLogs] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Run a workflow
  const runWorkflow = useCallback(async (workflowId, inputs) => {
    setExecuting(true);
    setError(null);
    setExecutionResult(null);
    try {
      const result = await executionAPI.runWorkflow(workflowId, inputs);
      setExecutionResult(result);
      return result;
    } catch (err) {
      setError(err.message || 'Workflow execution failed');
      console.error('Execution failed:', err);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  // Fetch all execution logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await executionAPI.getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch execution logs');
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single execution log
  const fetchLogById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await executionAPI.getLogById(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch execution log');
      console.error('Failed to fetch log:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    logs,
    executing,
    executionResult,
    loading,
    error,
    runWorkflow,
    fetchLogs,
    fetchLogById,
  };
};

export default useExecution;