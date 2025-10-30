import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home.jsx';

describe('Home page', () => {
  it('renders highlight section content', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Home />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /Experiência MasterFork/i })
    ).toBeInTheDocument();
  });
});
