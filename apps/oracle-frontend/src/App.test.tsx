// src/App.test.tsx
import { render, screen, within } from '@test-utils/customRender';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from './App';

test('renders navigation links', () => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
      },
    ],
    { initialEntries: ['/'] },
  );

  render(<RouterProvider router={router} />);

  const nav = screen.getByRole('navigation');
  expect(within(nav).getByText(/home/i)).toBeInTheDocument();
  expect(within(nav).getByText(/spiral path/i)).toBeInTheDocument();
  expect(within(nav).getByText(/oracle/i)).toBeInTheDocument();
  expect(within(nav).getByText(/memories/i)).toBeInTheDocument();

  // Remove or comment this line unless you're re-adding the About page:
  // expect(within(nav).getByText(/about/i)).toBeInTheDocument();
});
