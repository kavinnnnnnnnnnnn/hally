import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorIcon from '@mui/icons-material/Error';

const statusConfig = {
  completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
  running: { color: 'info', icon: <HourglassTopIcon fontSize="small" />, label: 'Running' },
  pending: { color: 'default', icon: <RadioButtonUncheckedIcon fontSize="small" />, label: 'Pending' },
  failed: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Failed' },
};

const ExecutionLog = ({ steps, executionId }) => {
  if (!steps || steps.length === 0) return null;

  // Deduplicate and normalize: keep the latest status for each step name
  const stepMap = new Map();
  steps.forEach(s => {
    const name = s.step_name || s.step || 'Unknown Step';
    const status = (s.status || 'pending').toLowerCase();
    stepMap.set(name, {
      status,
      error: s.error_message,
      result: s.result,
      nextStep: s.selected_next_step,
    });
  });
  const uniqueSteps = Array.from(stepMap.entries()).map(([step, data]) => ({ step, ...data }));

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Execution Progress {executionId && <Chip label={executionId} size="small" sx={{ ml: 1 }} />}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {uniqueSteps.map((item, index) => {
          const config = statusConfig[item.status] || statusConfig.pending;
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              {/* Vertical timeline line */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, mt: 0.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: item.status === 'completed' ? 'success.light'
                      : item.status === 'running' ? 'info.light'
                      : item.status === 'failed' || item.status === 'warning' ? 'error.light'
                      : 'grey.200',
                    color: item.status === 'completed' ? 'success.dark'
                      : item.status === 'running' ? 'info.dark'
                      : item.status === 'failed' || item.status === 'warning' ? 'error.dark'
                      : 'grey.500',
                  }}
                >
                  {config.icon}
                </Box>
                {index < uniqueSteps.length - 1 && (
                  <Box sx={{
                    width: 2,
                    height: 24,
                    bgcolor: item.status === 'completed' ? 'success.main' : 'grey.300',
                  }} />
                )}
              </Box>
              {/* Step info */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={item.status === 'running' ? 'bold' : 'normal'}>
                  {item.step}
                </Typography>
                {/* Show result / routing detail */}
                {item.result && !['MATCHED', 'ENDPOINT'].includes(item.result) && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.result === 'DEFAULT' && `⚡ No condition matched — used DEFAULT rule`}
                    {item.result === 'NO_MATCH' && `⚠️ No rule matched & no DEFAULT rule found`}
                    {item.result === 'ERROR' && `❌ Rule evaluation error`}
                  </Typography>
                )}
                {item.result === 'ENDPOINT' && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                    ✅ Step completed — workflow finished
                  </Typography>
                )}
                {(() => {
                  // Parse the ruleLog JSON to get next_step_name
                  try {
                    const ruleLog = JSON.parse(item.ruleEvaluated || '{}');
                    const nextName = ruleLog.next_step_name;
                    if (nextName && nextName !== 'FINISH') {
                      return (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          → Routed to: {nextName}
                        </Typography>
                      );
                    }
                    return null;
                  } catch { return null; }
                })()}
                {item.error && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                    Error: {item.error}
                  </Typography>
                )}
              </Box>
              <Chip
                label={item.status === 'warning' ? 'Warning' : config.label}
                color={item.status === 'warning' ? 'warning' : config.color}
                size="small"
                variant={item.status === 'running' ? 'filled' : 'outlined'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default ExecutionLog;