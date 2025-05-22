// src/components/__tests__/OracleChat.test.tsx
import { render, screen } from '@test-utils/customRender';
import ChatInterface from '../ChatInterface';

describe('Oracle Chat', () => {
  it('renders input and send button', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/who am i becoming/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('does not submit on empty input', () => {
    render(<ChatInterface />);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(screen.getByRole('log')).toBeEmptyDOMElement();
  });

  it('displays user message when input is provided', () => {
    render(<ChatInterface />);
    fireEvent.change(screen.getByPlaceholderText(/who am i becoming/i), {
      target: { value: 'What is my soul path?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(screen.getByText('What is my soul path?')).toBeInTheDocument();
  });
});
