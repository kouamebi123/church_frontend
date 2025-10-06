import React from 'react';
import { Box, Container, Typography, IconButton, styled } from '@mui/material';
import { Instagram, YouTube } from '@mui/icons-material';
import i18nService from '../services/i18nService';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(3, 0),
  marginTop: 'auto'
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
  gap: theme.spacing(1)
}));

const SocialIcons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1)
}));

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContainer maxWidth="lg">
        <FooterSection>
          <Typography variant="body1" sx={{ cursor: 'pointer', color: 'white' }}>
            {i18nService.t('footer.copyright')}
          </Typography>
        </FooterSection>

        <FooterSection>
          <img
            src="/logo-sm-acer.png"
            alt="Logo ACER"
            style={{ width: '60px', height: '60px', borderRadius: '50%' }}
          />
        </FooterSection>

        <FooterSection>
          <Typography variant="body1" sx={{ cursor: 'pointer', color: 'white' }}>
            {i18nService.t('footer.socialMedia')}
          </Typography>
          <SocialIcons>
            <IconButton
              href="https://www.instagram.com/acer_eglise_rennes/?hl=fr"
              target="_blank"
              color="inherit"
            >
              <Instagram />
            </IconButton>
            <IconButton
              href="https://www.youtube.com/c/Egliseacerrennes"
              target="_blank"
              color="inherit"
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
