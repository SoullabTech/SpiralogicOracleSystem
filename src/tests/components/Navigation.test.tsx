import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';

describe('Navigation Component', () => {
  it('renders navigation links correctly', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Test logo text
    expect(screen.getByText('🌀 Spiral Mirror')).toBeInTheDocument();
    
    // Test navigation links using role
    expect(screen.getByRole('link', { name: /Mirror/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    // Test link attributes using role
    expect(screen.getByRole('link', { name: /Mirror/i })).toHaveAttribute('href', '/mirror');
    expect(screen.getByRole('link', { name: /Profile/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '/settings');
  });
});