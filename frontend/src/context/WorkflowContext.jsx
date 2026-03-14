import React, { createContext, useState, useContext } from 'react';

const WorkflowContext = createContext(null);

export const WorkflowProvider = ({ children }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <WorkflowContext.Provider value={{ workflows, setWorkflows, loading, setLoading }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflowContext = () => useContext(WorkflowContext);
