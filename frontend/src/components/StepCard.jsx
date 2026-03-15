import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskIcon from '@mui/icons-material/Assignment';
import ApprovalIcon from '@mui/icons-material/ThumbUp';
import NotificationIcon from '@mui/icons-material/Notifications';

const typeConfig = {
  task: { color: 'primary', icon: <TaskIcon fontSize="small" /> },
  approval: { color: 'warning', icon: <ApprovalIcon fontSize="small" /> },
  notification: { color: 'info', icon: <NotificationIcon fontSize="small" /> },
};

const StepCard = ({ step, index, onEdit, onDelete }) => {
  const config = typeConfig[step.step_type] || typeConfig.task;

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', minWidth: 30 }}>
            #{index + 1}
          </Typography>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">{step.name}</Typography>
            <Chip
              icon={config.icon}
              label={step.step_type ? (step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1)) : 'Task'}
              color={config.color}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
        <Box>
          <Tooltip title="Edit Step">
            <IconButton color="primary" onClick={() => onEdit(step)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Step">
            <IconButton color="error" onClick={() => onDelete(step.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepCard;