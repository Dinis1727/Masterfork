import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: actual.MemoryRouter,
  };
});

test('renders header brand text', () => {
  render(<App />);
  expect(screen.getByText(/MasterFork/i)).toBeInTheDocument();
});
