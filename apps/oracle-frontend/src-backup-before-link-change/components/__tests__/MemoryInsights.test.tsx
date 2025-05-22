import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { vi } from 'vitest';
import MemoryInsights from '../MemoryInsights';

// Mock axios with Vitest
vi.mock('axios');
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe('MemoryInsights', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: ['Insight 1', 'Insight 2'],
    });
  });

  it('renders insights correctly', async () => {
    render(<MemoryInsights />);

    // Wait for both insights to appear
    await waitFor(() => {
      expect(screen.getByText('Insight 1')).toBeInTheDocument();
      expect(screen.getByText('Insight 2')).toBeInTheDocument();
    });
  });

  it('shows fallback message if no insights are available', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<MemoryInsights />);

    await waitFor(() =>
      expect(
        screen.getByText(/no insights available/i)
      ).toBeInTheDocument()
    );
  });

  it('handles network errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    render(<MemoryInsights />);

    await waitFor(() =>
      expect(
        screen.getByText(/no insights available/i)
      ).toBeInTheDocument()
    );
  });
});
