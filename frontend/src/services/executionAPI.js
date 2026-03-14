import API from './api';

export const executionAPI = {
  // POST /workflows/:workflowId/execute - Execute a workflow
  runWorkflow: async (workflowId, inputs) => {
    const response = await API.post(`/workflows/${workflowId}/execute`, { inputs });
    return response.data;
  },

  // GET /executions - Fetch all execution logs
  getLogs: async () => {
    const response = await API.get('/executions');
    return response.data;
  },

  // GET /executions/:id - Fetch single execution log
  getLogById: async (id) => {
    const response = await API.get(`/executions/${id}`);
    return response.data;
  },

  // GET /executions - Alias for getLogs
  getExecutionLogs: async () => {
    const response = await API.get('/executions');
    return response.data;
  },
};