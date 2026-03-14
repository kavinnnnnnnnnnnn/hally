// Step types
export const STEP_TYPES = ['task', 'approval', 'notification'];

// Workflow statuses
export const WORKFLOW_STATUSES = ['Active', 'Inactive', 'Draft'];

// Execution statuses
export const EXECUTION_STATUSES = ['Success', 'Failed', 'Running', 'Pending'];

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Application title
export const APP_TITLE = 'Workflow Automation System';

// Route paths
export const ROUTES = {
  DASHBOARD: '/dashboard',
  WORKFLOWS: '/workflows',
  WORKFLOW_CREATE: '/workflows/create',
  WORKFLOW_EDIT: (id) => `/workflows/${id}/edit`,
  WORKFLOW_STEPS: (id) => `/workflows/${id}/steps`,
  WORKFLOW_RULES: (id) => `/workflows/${id}/rules`,
  WORKFLOW_EXECUTE: (id) => `/workflows/${id}/execute`,
  LOGS: '/logs',
};

// Field types for input schema
export const FIELD_TYPES = ['string', 'number', 'boolean'];