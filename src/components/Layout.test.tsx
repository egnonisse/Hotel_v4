import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth';

const queryClient = new QueryClient();

const MockLayout = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Layout', () => {
  it('renders navigation and main content area', () => {
    render(<MockLayout />);
    
    expect(screen.getByText('HotelHub')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<MockLayout />);
    
    const main = document.querySelector('main');
    expect(main).toHaveClass('flex-1', 'ml-64', 'p-8');
  });
});