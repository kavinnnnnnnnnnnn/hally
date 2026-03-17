import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from '../pages/Dashboard';
import WorkflowList from '../pages/WorkflowList';
import WorkflowEditor from '../pages/WorkflowEditor';
import StepEditor from '../pages/StepEditor';
import RuleEditor from '../pages/RuleEditor';
import ExecutionPage from '../pages/ExecutionPage';
import LogsPage from '../pages/LogsPage';
import AnimatedPage from '../components/AnimatedPage';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/workflows" element={<AnimatedPage><WorkflowList /></AnimatedPage>} />
        <Route path="/workflows/create" element={<AnimatedPage><WorkflowEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/edit" element={<AnimatedPage><WorkflowEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/steps" element={<AnimatedPage><StepEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/rules" element={<AnimatedPage><RuleEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/execute" element={<AnimatedPage><ExecutionPage /></AnimatedPage>} />
        <Route path="/logs" element={<AnimatedPage><LogsPage /></AnimatedPage>} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
