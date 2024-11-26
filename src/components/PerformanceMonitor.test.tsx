import { render } from '@testing-library/react';
import PerformanceMonitor from './PerformanceMonitor';
import { trackRender } from '../lib/monitoring';
import { vi } from 'vitest';

vi.mock('../lib/monitoring', () => ({
  trackRender: {
    start: vi.fn(),
    end: vi.fn(),
  },
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts tracking on mount and stops on unmount', () => {
    const { unmount } = render(
      <PerformanceMonitor id="test">
        <div>Test content</div>
      </PerformanceMonitor>
    );

    expect(trackRender.start).toHaveBeenCalledWith('test');
    expect(trackRender.end).not.toHaveBeenCalled();

    unmount();

    expect(trackRender.end).toHaveBeenCalledWith('test');
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <PerformanceMonitor id="test">
        <div>Test content</div>
      </PerformanceMonitor>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });
});