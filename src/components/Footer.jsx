import React from 'react';
import { Box, Container, Typography, IconButton, styled } from '@mui/material';
import { Instagram, YouTube } from '@mui/icons-material';
import i18nService from '@services/i18nService';

const FooterWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #6D28D9 100%)',
  color: 'white',
  padding: theme.spacing(4, 0),
  marginTop: 'auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
    animation: 'shimmer 2s infinite'
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-1000px 0' },
    '100%': { backgroundPosition: '1000px 0' }
  }
}));

const FooterContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center'
  }
}));

const FooterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const SocialIcons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  '& .MuiIconButton-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      transform: 'scale(1.15) rotate(5deg)',
      boxShadow: '0 8px 20px rgba(255, 255, 255, 0.2)'
    }
  }
}));

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContainer maxWidth="lg">
        <FooterSection>
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer', 
              color: 'white',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {i18nService.t('footer.copyright')}
          </Typography>
        </FooterSection>

        <FooterSection>
          <Box 
            sx={{ 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%',
              padding: '5px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(360deg)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
              }
            }}
          >
            <img
              src="/logo-sm-acer.png"
              alt="Logo ACER"
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </Box>
        </FooterSection>

        <FooterSection>
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer', 
              color: 'white',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              mb: 1
            }}
          >
            {i18nService.t('footer.socialMedia')}
          </Typography>
          <SocialIcons>
            <IconButton
              href="https://www.instagram.com/acer_eglise_rennes/?hl=fr"
              target="_blank"
              color="inherit"
              sx={{
                '&:hover': {
                  background: 'radial-gradient(circle, #E1306C, #C13584, #833AB4)'
                }
              }}
            >
              <Instagram />
            </IconButton>
            <IconButton
              href="https://www.youtube.com/c/Egliseacerrennes"
              target="_blank"
              color="inherit"
              sx={{
                '&:hover': {
                  background: '#FF0000'
                }
              }}
            >
              <YouTube />
            </IconButton>
          </SocialIcons>
        </FooterSection>
      </FooterContainer>
    </FooterWrapper>
  );
};

export default Footer;
