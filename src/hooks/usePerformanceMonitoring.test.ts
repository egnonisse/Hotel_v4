import { renderHook } from '@testing-library/react';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { trackRouteChange } from '../lib/monitoring';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../lib/monitoring', () => ({
  trackRouteChange: {
    start: vi.fn(),
    end: vi.fn(),
  },
}));

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts tracking on mount and stops on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceMonitoring(), {
      wrapper: BrowserRouter,
    });

    expect(trackRouteChange.start).toHaveBeenCalledWith('/');
    expect(trackRouteChange.end).not.toHaveBeenCalled();

    unmount();

    expect(trackRouteChange.end).toHaveBeenCalledWith('/');
  });
});