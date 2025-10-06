import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import OptimizedCard from '../../components/common/OptimizedCard';
import { People } from '@mui/icons-material';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('OptimizedCard', () => {
  const defaultProps = {
    title: 'Test Card',
    value: '123',
    icon: People
  };

  it('renders correctly with default props', () => {
    renderWithTheme(<OptimizedCard {...defaultProps} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    renderWithTheme(<OptimizedCard {...defaultProps} variant="primary" />);

    const card = screen.getByText('Test Card').closest('[class*="MuiPaper"]');
    expect(card).toHaveStyle({ backgroundColor: expect.stringContaining('primary') });
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    renderWithTheme(<OptimizedCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByText('Test Card').closest('[class*="MuiPaper"]');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when not provided', () => {
    renderWithTheme(<OptimizedCard {...defaultProps} />);

    const card = screen.getByText('Test Card').closest('[class*="MuiPaper"]');
    expect(card).toHaveStyle({ cursor: 'default' });
  });

  it('applies custom props', () => {
    renderWithTheme(<OptimizedCard {...defaultProps} data-testid="custom-card" />);

    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });
});