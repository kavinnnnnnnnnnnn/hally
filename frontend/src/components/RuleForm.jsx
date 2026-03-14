import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RuleForm = ({ rule, index, onEdit, onDelete }) => {
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
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={`Priority: ${rule.priority}`} size="small" color="warning" variant="outlined" />
              <Chip
                icon={<ArrowForwardIcon fontSize="small" />}
                label={`Next: ${rule.nextStep}`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            <Box
              sx={{
                bgcolor: 'grey.100',
                borderRadius: 1,
                px: 2,
                py: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: 'text.primary',
              }}
            >
              {rule.condition}
            </Box>
          </Box>
          <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column' }}>
            <Tooltip title="Edit Rule">
              <IconButton color="primary" onClick={() => onEdit(rule)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Rule">
              <IconButton color="error" onClick={() => onDelete(rule.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RuleForm;