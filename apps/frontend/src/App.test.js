import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header brand text', () => {
  render(<App />);
  expect(screen.getByText(/MasterFork/i)).toBeInTheDocument();
});
