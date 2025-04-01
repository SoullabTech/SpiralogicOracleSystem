import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../components/Login';

describe('Login Component', () => {
  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/Spiral Mirror/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the Mirror/i)).toBeInTheDocument();
  });

  it('navigates on button click', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const button = getByText(/Enter the Mirror/i);
    fireEvent.click(button);

    // Verify navigation occurred
    expect(window.location.pathname).toBe('/mirror');
  });
});