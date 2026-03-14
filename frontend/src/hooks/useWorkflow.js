import { useState, useEffect, useCallback } from 'react';
import { workflowAPI } from '../services/workflowAPI';

const useWorkflow = (workflowId = null) => {
  const [workflows, setWorkflows] = useState([]);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all workflows
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workflowAPI.getWorkflows();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch workflows');
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single workflow
  const fetchWorkflow = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workflowAPI.getWorkflow(id);
      setWorkflow(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch workflow');
      console.error('Failed to fetch workflow:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create workflow
  const createWorkflow = useCallback(async (workflowData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workflowAPI.createWorkflow(workflowData);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create workflow');
      console.error('Failed to create workflow:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update workflow
  const updateWorkflow = useCallback(async (id, workflowData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workflowAPI.updateWorkflow(id, workflowData);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update workflow');
      console.error('Failed to update workflow:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete workflow
  const deleteWorkflow = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await workflowAPI.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete workflow');
      console.error('Failed to delete workflow:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if no specific ID
  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId, fetchWorkflow]);

  return {
    workflows,
    workflow,
    loading,
    error,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  };
};

export default useWorkflow;