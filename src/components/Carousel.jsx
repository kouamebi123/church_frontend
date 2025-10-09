import React, { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '@utils/errorHandler';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';
import { apiService } from '@services/apiService';
import i18nService from '@services/i18nService';
import { API_BASE_URL } from '../config/apiConfig';

import { keyframes } from '@mui/system';

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '600px',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  borderRadius: '0 0 40px 40px',
  boxShadow: '0 20px 60px rgba(102, 45, 145, 0.13)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(90, 33, 182, 0.04) 0%, rgba(90, 33, 182, 0.06) 50%, rgba(90, 33, 182, 0.12) 100%)',
    pointerEvents: 'none',
    zIndex: 1
  }
}));

const CarouselSlide = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  opacity: 0,
  transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.active': {
    opacity: 1,
    '& img': {
      transform: 'scale(1.05)'
    }
  }
}));

const zoomIn = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.15);
  }
`;

const CarouselImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  animation: `${zoomIn} 20s ease-in-out infinite alternate`,
  filter: 'brightness(0.85) contrast(1.1)',
  transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
});

const CarouselCaption = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  color: 'white',
  zIndex: 3,
  width: '90%',
  maxWidth: '900px',
  padding: theme.spacing(4),
  background: 'rgba(102, 45, 145, 0.15)',
  backdropFilter: 'blur(15px)',
  borderRadius: '30px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  animation: '$fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translate(-50%, -40%) scale(0.9)'
    },
    to: {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)'
    }
  },
  '& h3, & h4, & h5': {
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    fontWeight: 700,
    letterSpacing: '0.5px'
  }
}));

const CarouselControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  transform: 'translateY(-50%)',
  zIndex: 2
}));

const CarouselIndicators = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  zIndex: 2
}));

const CarouselIndicator = styled(Box)(({ theme }) => ({
  width: 40,
  height: 4,
  backgroundColor: 'var(--carousel-dot)',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    width: 50
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light
  }
}));

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await apiService.carousel.getAll();
        const data = response.data?.data || response.data || [];
        setImages(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        const processedError = handleApiError(err, i18nService.t('images.loadingError'));
            ;
        setError(processedError.message);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchImages();
    
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, images]);

  return (
    <CarouselContainer>
      {/* Bloc des textes fixes superposés */}
      <Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'var(--carousel-overlay-bg)'
          }}
        />
        <CarouselCaption>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 3, 
              color: 'white',
              fontWeight: 900,
              textShadow: '2px 2px 4px var(--carousel-text-shadow)',
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }
            }}
          >
            {i18nService.t('home.welcome.title')}
          </Typography>
          <Divider
            sx={{
              my: 2,
              borderColor: 'primary.main',
              borderWidth: 2,
              width: 250,
              mx: 'auto',
              borderRadius: 2,
              opacity: 1
            }}
          />
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 500,
              color: 'white',
              textShadow: '1px 1px 3px var(--carousel-text-shadow)',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
            }}
          >
            {i18nService.t('home.welcome.subtitle')}
          </Typography>
        </CarouselCaption>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography>{i18nService.t('common.actions.loading')}</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : images.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography>{i18nService.t('home.carousel.noImages')}</Typography>
        </Box>
      ) : images.map((image, index) => (
        <CarouselSlide key={image.id || image._id} className={index === currentSlide ? 'active' : ''}>
          <CarouselImage src={`${API_BASE_URL}${image.image_url}`} alt={`Slide ${index + 1}`} />
          
        </CarouselSlide>
      ))}
      <CarouselControls>
        <IconButton
          onClick={prevSlide}
          sx={{
            color: 'white',
            background: 'linear-gradient(135deg,rgba(102, 45, 145, 0.35),rgba(158, 0, 92, 0.3))',
            boxShadow: '0 4px 16px rgba(102, 45, 145, 0.3)',
            width: { xs: 30, sm: 40, md: 48 },
            height: { xs: 30, sm: 40, md: 48 },
            '& svg': { fontSize: { xs: 24, sm: 28, md: 32 } },
            '&:hover': {
              background: 'linear-gradient(135deg,rgba(102, 45, 145, 0.35),rgba(158, 0, 92, 0.3))',
              transform: 'scale(1.15)',
              boxShadow: '0 6px 20px rgba(102, 45, 145, 0.4)',
            },
            transition: 'all 0.3s',
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={nextSlide}
          sx={{
            color: 'white',
            background: 'linear-gradient(135deg,rgba(102, 45, 145, 0.35),rgba(158, 0, 92, 0.3))',
            boxShadow: '0 4px 16px rgba(102, 45, 145, 0.3)',
            width: { xs: 30, sm: 40, md: 48 },
            height: { xs: 30, sm: 40, md: 48 },
            '& svg': { fontSize: { xs: 24, sm: 28, md: 32 } },
            '&:hover': {
              background: 'linear-gradient(135deg,rgba(102, 45, 145, 0.35),rgba(158, 0, 92, 0.3))',
              transform: 'scale(1.15)',
              boxShadow: '0 6px 20px rgba(102, 45, 145, 0.4)',
            },
            transition: 'all 0.3s',
          }}
        >
          <ChevronRight />
        </IconButton>
      </CarouselControls>
      <CarouselIndicators>
        {images.map((_, index) => (
          <CarouselIndicator
            key={index}
            className={index === currentSlide ? 'active' : ''}
            onClick={() => goToSlide(index)}
          />
        ))}
      </CarouselIndicators>
    </CarouselContainer>
  );
};

export default Carousel;
