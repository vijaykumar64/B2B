import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { useCountUp } from '../useCountUp';

let observerCallback: IntersectionObserverCallback;
let mockObserve: ReturnType<typeof vi.fn>;
let mockDisconnect: ReturnType<typeof vi.fn>;

function CountUpDisplay({ target, duration }: { target: number; duration?: number }) {
  const { ref, value } = useCountUp(target, duration);
  return <span ref={ref as React.RefObject<HTMLSpanElement>} data-testid="counter">{value}</span>;
}

describe('useCountUp', () => {
  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    class MockIntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
      constructor(cb: IntersectionObserverCallback) { observerCallback = cb; }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now() + 2000);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('initializes with value 0', () => {
    render(<CountUpDisplay target={500} />);
    expect(screen.getByTestId('counter').textContent).toBe('0');
  });

  it('observes the element after mount', () => {
    render(<CountUpDisplay target={100} />);
    expect(mockObserve).toHaveBeenCalled();
  });

  it('starts counting when element intersects', () => {
    render(<CountUpDisplay target={100} duration={100} />);
    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    const value = parseInt(screen.getByTestId('counter').textContent || '0', 10);
    expect(value).toBeGreaterThan(0);
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = render(<CountUpDisplay target={100} />);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
