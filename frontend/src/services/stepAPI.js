import API from './api';

export const stepAPI = {
  // GET /workflows/:workflowId/steps - Fetch steps for a workflow
  getSteps: async (workflowId) => {
    const response = await API.get(`/workflows/${workflowId}/steps`);
    return response.data;
  },

  // GET /workflows/:workflowId/steps/:stepId - Fetch single step
  getStep: async (workflowId, stepId) => {
    const response = await API.get(`/workflows/${workflowId}/steps/${stepId}`);
    return response.data;
  },

  // POST /workflows/:workflowId/steps - Create a new step
  createStep: async (workflowId, stepData) => {
    const response = await API.post(`/workflows/${workflowId}/steps`, stepData);
    return response.data;
  },

  // PUT /workflows/:workflowId/steps/:stepId - Update a step
  updateStep: async (workflowId, stepId, stepData) => {
    const response = await API.put(`/workflows/${workflowId}/steps/${stepId}`, stepData);
    return response.data;
  },

  // DELETE /workflows/:workflowId/steps/:stepId - Delete a step
  deleteStep: async (workflowId, stepId) => {
    const response = await API.delete(`/workflows/${workflowId}/steps/${stepId}`);
    return response.data;
  },

  // Alias for backward compatibility
  getStepsByWorkflow: async (workflowId) => {
    const response = await API.get(`/workflows/${workflowId}/steps`);
    return response.data;
  },
};