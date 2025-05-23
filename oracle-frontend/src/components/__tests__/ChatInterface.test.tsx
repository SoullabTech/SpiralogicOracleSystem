import { fireEvent, render, screen } from '@test-utils/customRender';
import ChatInterface from '../ChatInterface';

describe('ChatInterface', () => {
  it('renders input and send button', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/who am i becoming/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('does not submit on empty input', () => {
    render(<ChatInterface />);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
