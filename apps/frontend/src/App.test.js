import { render, screen, within } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  const MemoryRouterWithFlags = ({ children }) => (
    <actual.MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {children}
    </actual.MemoryRouter>
  );
  return {
    ...actual,
    BrowserRouter: MemoryRouterWithFlags,
  };
});

test('renders header brand text', () => {
  render(<App />);
  const header = screen.getByRole('banner');
  expect(within(header).getByText('MasterFork')).toBeInTheDocument();
});
