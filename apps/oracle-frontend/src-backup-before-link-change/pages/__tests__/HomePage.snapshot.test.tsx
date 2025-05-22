// src/pages/__tests__/HomePage.snapshot.test.tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';

describe('HomePage snapshot', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
