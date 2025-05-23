// src/pages/__tests__/HomePage.tsx
import { render, screen } from '@test-utils/customRender';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';

describe('HomePage', () => {
  it('renders heading and navigation links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Heading
    expect(
      screen.getByRole('heading', { name: /Welcome to Soullab/i })
    ).toBeInTheDocument();

    // Links
    expect(screen.getByRole('link', { name: /Enter Spiral/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Meet Your Oracle/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Memories/i })).toBeInTheDocument();
  });
});
