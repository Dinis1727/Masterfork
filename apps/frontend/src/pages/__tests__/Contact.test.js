import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home.jsx';

describe('Home page', () => {
  it('renders highlight section content', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Experiência MasterFork/i)).toBeInTheDocument();
  });
});
