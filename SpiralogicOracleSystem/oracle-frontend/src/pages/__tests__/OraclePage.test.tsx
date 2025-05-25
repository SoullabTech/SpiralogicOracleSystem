import { render, screen, waitFor } from '@test-utils/customRender';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import OraclePage from '../OraclePage';

vi.mock('@/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          oracle_name: 'fire',
          oracle_archetype: 'Visionary',
          oracle_element: 'Fire',
          description: 'A fiery oracle ready to inspire.',
        },
        error: null,
      }),
    },
  };
});

test('renders oracle agent intro message', async () => {
  render(
    <MemoryRouter initialEntries={['/oracle/fire']}>
      <Routes>
        <Route path="/oracle/:guideId" element={<OraclePage />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /fire/i })).toBeInTheDocument();
  });
});
