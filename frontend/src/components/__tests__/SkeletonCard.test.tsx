import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonCard } from '../skeletons/SkeletonCard';

describe('SkeletonCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains animate-pulse elements', () => {
    const { container } = render(<SkeletonCard />);
    const pulseEls = container.querySelectorAll('.animate-pulse');
    expect(pulseEls.length).toBeGreaterThan(0);
  });

  it('has an image placeholder area', () => {
    const { container } = render(<SkeletonCard />);
    // Image area is the first animate-pulse div with h-48
    const imageArea = container.querySelector('.h-48');
    expect(imageArea).toBeInTheDocument();
  });
});
