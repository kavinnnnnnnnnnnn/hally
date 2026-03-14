import React from 'react';
import { Card, CardContent, CardActions, Typography, Chip, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const WorkflowCard = ({ workflow }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">{workflow.name}</Typography>
          <Chip
            label={workflow.status}
            color={workflow.status === 'Active' ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Version: {workflow.version}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/workflows/${workflow.id}/edit`)}>
          Edit
        </Button>
        <Button size="small" startIcon={<AccountTreeIcon />} onClick={() => navigate(`/workflows/${workflow.id}/steps`)}>
          Steps
        </Button>
        <Button size="small" startIcon={<RuleIcon />} onClick={() => navigate(`/workflows/${workflow.id}/rules`)}>
          Rules
        </Button>
        <Button size="small" color="success" startIcon={<PlayArrowIcon />} onClick={() => navigate(`/workflows/${workflow.id}/execute`)}>
          Execute
        </Button>
      </CardActions>
    </Card>
  );
};

export default WorkflowCard;