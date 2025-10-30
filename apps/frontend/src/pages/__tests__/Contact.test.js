import { render, screen } from '@testing-library/react';
import Home from '../Home.jsx';

describe('Home page', () => {
  it('renders highlight section content', () => {
    render(<Home />);
    expect(screen.getByText(/Experiência MasterFork/i)).toBeInTheDocument();
  });
});
