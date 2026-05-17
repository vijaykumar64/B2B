import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Search } from 'lucide-react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No results" description="Try a different search." />);
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try a different search.')).toBeInTheDocument();
  });

  it('renders optional action node', () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here."
        action={<button>Retry</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders with an icon without crashing', () => {
    render(<EmptyState icon={Search} title="Not found" description="No items." />);
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('renders without action when not provided', () => {
    const { container } = render(<EmptyState title="Empty" description="Nothing." />);
    expect(container.querySelector('button')).toBeNull();
  });
});
