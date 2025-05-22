// src/test-utils/customRender.tsx

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialEntries?: string[];
}

const AllProviders = ({
  children,
  initialEntries,
}: {
  children: ReactNode;
  initialEntries?: string[];
}) => {
  if (initialEntries && initialEntries.length > 0) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const { initialEntries, ...rest } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
    ),
    ...rest,
  });
};

export * from '@testing-library/react';
export { customRender as render };

