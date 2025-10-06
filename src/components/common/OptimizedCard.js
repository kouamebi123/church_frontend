import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Paper)(({ theme, variant = 'default' }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: variant === 'primary' ? theme.palette.primary.main : 'white',
  color: variant === 'primary' ? 'white' : theme.palette.text.primary,
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
  }
}));

const IconWrapper = styled(Box)(({ theme, variant = 'default' }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: variant === 'primary' ? 'white' : theme.palette.primary.main,
  color: variant === 'primary' ? theme.palette.primary.main : 'white',
  marginBottom: theme.spacing(2)
}));

const OptimizedCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  onClick,
  ...props 
}) => {
  return (
    <StyledCard 
      variant={variant} 
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      <IconWrapper variant={variant}>
        <Icon sx={{ fontSize: 30 }} />
      </IconWrapper>
      <Typography variant="h6" align="center">
        {title}
      </Typography>
      <Typography variant="h4" color="primary" align="center">
        {value}
      </Typography>
    </StyledCard>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

export default OptimizedCard; 