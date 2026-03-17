import API from './api';

export const workflowAPI = {
  // GET /workflows - Fetch all workflows
  getWorkflows: async () => {
    const response = await API.get('/workflows');
    return response.data;
  },

  // GET /workflows/:id - Fetch single workflow
  getWorkflow: async (id) => {
    const response = await API.get(`/workflows/${id}`);
    return response.data;
  },

  // POST /workflows - Create a new workflow
  createWorkflow: async (workflowData) => {
    const response = await API.post('/workflows', workflowData);
    return response.data;
  },

  // PUT /workflows/:id - Update an existing workflow
  updateWorkflow: async (id, workflowData) => {
    const response = await API.put(`/workflows/${id}`, workflowData);
    return response.data;
  },

  // DELETE /workflows/:id - Delete a workflow
  deleteWorkflow: async (id) => {
    const response = await API.delete(`/workflows/${id}`);
    return response.data;
  },

  // Alias for backward compatibility
  getAllWorkflows: async () => {
    const response = await API.get('/workflows');
    return response.data;
  },

  // GET /workflows/stats - Fetch dashboard statistics
  getStats: async () => {
    const response = await API.get('/workflows/stats');
    return response.data;
  },
  getAnalytics: async () => {
    const response = await API.get('/workflows/analytics');
    return response.data;
  },
};