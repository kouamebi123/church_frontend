import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Paper)(({ theme, variant = 'default' }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, #5B21B6, #7C3AED)' 
    : 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
  color: variant === 'primary' ? 'white' : theme.palette.text.primary,
  borderRadius: '20px',
  border: `2px solid ${variant === 'primary' ? 'rgba(255,255,255,0.2)' : 'rgba(91, 33, 182, 0.1)'}`,
  boxShadow: variant === 'primary' 
    ? '0 10px 40px rgba(91, 33, 182, 0.25)' 
    : '0 10px 40px rgba(91, 33, 182, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #8B5CF6)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: variant === 'primary'
      ? '0 20px 60px rgba(91, 33, 182, 0.35)'
      : '0 20px 60px rgba(91, 33, 182, 0.15)',
    '&::before': {
      opacity: 1
    }
  }
}));

const IconWrapper = styled(Box)(({ theme, variant = 'default' }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'linear-gradient(135deg, #5B21B6, #7C3AED)',
  backdropFilter: variant === 'primary' ? 'blur(10px)' : 'none',
  color: 'white',
  marginBottom: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(91, 33, 182, 0.25)',
  border: variant === 'primary' ? '2px solid rgba(255,255,255,0.3)' : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 12px 32px rgba(91, 33, 182, 0.35)'
  }
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