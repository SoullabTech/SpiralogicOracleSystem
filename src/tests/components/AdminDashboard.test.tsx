import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../../components/AdminDashboard';
import { supabase } from '../../lib/supabase';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [
          {
            id: '1',
            name: 'Test Client',
            current_spiralogic_phase: 'Exploration',
            active_archetypes: ['Sage'],
            guidance_mode: 'Mentor',
            preferred_tone: 'Direct',
            last_interaction: new Date().toISOString(),
            fire_element: 60,
            water_element: 40,
            earth_element: 30,
            air_element: 20,
            aether_element: 10
          }
        ],
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dropdown options correctly', async () => {
    render(<AdminDashboard />);

    // Wait for client data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading clients...')).not.toBeInTheDocument();
    });

    // Check phase dropdown
    const phaseSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(phaseSelect);
    expect(screen.getByText('Initiation')).toBeInTheDocument();
    expect(screen.getByText('Exploration')).toBeInTheDocument();
    expect(screen.getByText('Integration')).toBeInTheDocument();
    expect(screen.getByText('Mastery')).toBeInTheDocument();

    // Check element dropdown
    const elementSelect = screen.getAllByRole('combobox')[1];
    fireEvent.click(elementSelect);
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Air')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Aether')).toBeInTheDocument();

    // Check archetype dropdown
    const archetypeSelect = screen.getAllByRole('combobox')[2];
    fireEvent.click(archetypeSelect);
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Mystic')).toBeInTheDocument();
    expect(screen.getByText('Visionary')).toBeInTheDocument();
    expect(screen.getByText('Healer')).toBeInTheDocument();
  });

  it('shows validation errors when required fields are missing', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading clients...')).not.toBeInTheDocument();
    });

    // Find update button and click it without selecting values
    const updateButton = screen.getByText('Update Profile');
    fireEvent.click(updateButton);

    // Check for error messages
    expect(screen.getByText('Phase is required')).toBeInTheDocument();
    expect(screen.getByText('Element is required')).toBeInTheDocument();
    expect(screen.getByText('Archetype is required')).toBeInTheDocument();
  });

  it('successfully updates profile when all fields are filled', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading clients...')).not.toBeInTheDocument();
    });

    // Fill in all required fields
    const selects = screen.getAllByRole('combobox');
    
    fireEvent.change(selects[0], { target: { value: 'Exploration' } });
    fireEvent.change(selects[1], { target: { value: 'Fire' } });
    fireEvent.change(selects[2], { target: { value: 'Sage' } });
    fireEvent.change(selects[3], { target: { value: 'Mentor' } });

    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Click update button
    const updateButton = screen.getByText('Update Profile');
    fireEvent.click(updateButton);

    // Verify Supabase update was called
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(alertMock).toHaveBeenCalledWith('Profile updated successfully!');
    });

    alertMock.mockRestore();
  });

  it('handles Supabase errors gracefully', async () => {
    // Mock Supabase error
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        data: null,
        error: new Error('Database error')
      }))
    }));

    render(<AdminDashboard />);

    // Verify error handling
    await waitFor(() => {
      expect(screen.queryByText('Loading clients...')).not.toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Failed to load clients:', expect.any(Error));
    });
  });

  it('filters clients correctly', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading clients...')).not.toBeInTheDocument();
    });

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Search clients...');
    fireEvent.change(searchInput, { target: { value: 'Test Client' } });
    expect(screen.getByText('Test Client')).toBeInTheDocument();

    // Test element filter
    const elementFilter = screen.getAllByRole('combobox')[0];
    fireEvent.change(elementFilter, { target: { value: 'fire' } });
    expect(screen.getByText('Test Client')).toBeInTheDocument();

    // Test phase filter
    const phaseFilter = screen.getAllByRole('combobox')[1];
    fireEvent.change(phaseFilter, { target: { value: 'exploration' } });
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });
});