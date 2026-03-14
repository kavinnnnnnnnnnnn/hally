import API from './api';

export const ruleAPI = {
  // GET /workflows/:workflowId/rules - Fetch rules for a workflow
  getRules: async (workflowId) => {
    const response = await API.get(`/workflows/${workflowId}/rules`);
    return response.data;
  },

  // GET /workflows/:workflowId/rules/:ruleId - Fetch single rule
  getRule: async (workflowId, ruleId) => {
    const response = await API.get(`/workflows/${workflowId}/rules/${ruleId}`);
    return response.data;
  },

  // POST /workflows/:workflowId/rules - Create a new rule
  createRule: async (workflowId, ruleData) => {
    const response = await API.post(`/workflows/${workflowId}/rules`, ruleData);
    return response.data;
  },

  // PUT /workflows/:workflowId/rules/:ruleId - Update a rule
  updateRule: async (workflowId, ruleId, ruleData) => {
    const response = await API.put(`/workflows/${workflowId}/rules/${ruleId}`, ruleData);
    return response.data;
  },

  // DELETE /workflows/:workflowId/rules/:ruleId - Delete a rule
  deleteRule: async (workflowId, ruleId) => {
    const response = await API.delete(`/workflows/${workflowId}/rules/${ruleId}`);
    return response.data;
  },

  // Alias for backward compatibility
  getRulesByWorkflow: async (workflowId) => {
    const response = await API.get(`/workflows/${workflowId}/rules`);
    return response.data;
  },
};