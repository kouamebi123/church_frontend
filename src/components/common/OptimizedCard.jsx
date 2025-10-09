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
    ? 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)' 
    : 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
  color: variant === 'primary' ? 'white' : theme.palette.text.primary,
  borderRadius: '20px',
  border: `2px solid ${variant === 'primary' ? 'rgba(255,255,255,0.2)' : 'rgba(102, 45, 145, 0.1)'}`,
  boxShadow: variant === 'primary' 
    ? '0 10px 40px rgba(102, 45, 145, 0.25)' 
    : '0 10px 40px rgba(102, 45, 145, 0.08)',
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
    background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: variant === 'primary'
      ? '0 20px 60px rgba(102, 45, 145, 0.35)'
      : '0 20px 60px rgba(102, 45, 145, 0.15)',
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
    : 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
  backdropFilter: variant === 'primary' ? 'blur(10px)' : 'none',
  color: 'white',
  marginBottom: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(102, 45, 145, 0.25)',
  border: variant === 'primary' ? '2px solid rgba(255,255,255,0.3)' : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 12px 32px rgba(102, 45, 145, 0.35)'
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