
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Yala card and audio controls', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /yala/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
});
