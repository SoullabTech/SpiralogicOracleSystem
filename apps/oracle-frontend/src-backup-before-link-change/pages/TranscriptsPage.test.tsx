import { render, screen } from '@testing-library/react';
import React from 'react';
import TranscriptsPage from './TranscriptsPage';

// Mock the child components to isolate the page rendering
vi.mock('../components/TranscriptForm', () => ({
  default: () => <div data-testid="transcript-form">Transcript Form</div>,
}));

vi.mock('../components/TranscriptCard', () => ({
  default: ({ title }: { title: string }) => <div data-testid="transcript-card">{title}</div>,
}));

// Mock fetch for transcripts
beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          transcripts: [
            { id: '1', title: 'Session A', content: '', created_at: new Date().toISOString() },
            { id: '2', title: 'Workshop B', content: '', created_at: new Date().toISOString() },
          ],
        }),
    }),
  ) as unknown as typeof fetch;
});

test('renders TranscriptsPage with form and transcripts', async () => {
  render(<TranscriptsPage />);

  // Verify the form shows up
  expect(await screen.findByTestId('transcript-form')).toBeInTheDocument();

  // Verify transcript cards
  expect(await screen.findByText('Session A')).toBeInTheDocument();
  expect(await screen.findByText('Workshop B')).toBeInTheDocument();
});
