import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import WorkflowList from '../pages/WorkflowList';
import WorkflowEditor from '../pages/WorkflowEditor';
import StepEditor from '../pages/StepEditor';
import RuleEditor from '../pages/RuleEditor';
import ExecutionPage from '../pages/ExecutionPage';
import LogsPage from '../pages/LogsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/workflows" element={<WorkflowList />} />
      <Route path="/workflows/create" element={<WorkflowEditor />} />
      <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
      <Route path="/workflows/:id/steps" element={<StepEditor />} />
      <Route path="/workflows/:id/rules" element={<RuleEditor />} />
      <Route path="/workflows/:id/execute" element={<ExecutionPage />} />
      <Route path="/logs" element={<LogsPage />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
