
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders multiple destination cards', () => {
  render(<App />);

  expect(screen.getByText(/yala/i)).toBeInTheDocument();
  expect(screen.getByText(/sigiriya/i)).toBeInTheDocument();
  expect(screen.getByText(/ella/i)).toBeInTheDocument();
});
