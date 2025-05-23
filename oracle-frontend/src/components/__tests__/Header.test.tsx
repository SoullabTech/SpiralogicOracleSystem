import { render, screen } from '@test-utils/customRender';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

describe('Header', () => {
  it('renders the app branding', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText(/oracle/i)).toBeInTheDocument(); // Match your brand title
  });

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
