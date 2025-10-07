import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ErrorBoundary from '@components/common/ErrorBoundary';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Composant qui lance une erreur pour tester ErrorBoundary
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    // Supprimer les erreurs de console pour ce test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Une erreur s'est produite/)).toBeInTheDocument();
    expect(screen.getByText(/Réessayer/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls retry when retry button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText(/Réessayer/);
    retryButton.click();

    // Après le retry, l'erreur devrait disparaître
    expect(screen.queryByText(/Une erreur s'est produite/)).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders custom error message when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithTheme(
      <ErrorBoundary customMessage="Custom error message">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
