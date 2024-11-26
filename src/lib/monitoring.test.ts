import { performance, trackRouteChange, trackRender } from './monitoring';
import { vi } from 'vitest';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.spyOn(window.performance, 'mark');
    vi.spyOn(window.performance, 'measure');
    vi.spyOn(window.performance, 'clearMarks');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('performance', () => {
    it('creates performance marks', () => {
      performance.mark('test-mark');
      expect(window.performance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('measures performance between marks', () => {
      performance.mark('start');
      performance.mark('end');
      performance.measure('test', 'start', 'end');
      expect(window.performance.measure).toHaveBeenCalledWith('test', 'start', 'end');
    });

    it('clears performance marks', () => {
      performance.clearMarks();
      expect(window.performance.clearMarks).toHaveBeenCalled();
    });
  });

  describe('trackRouteChange', () => {
    it('tracks route changes', () => {
      trackRouteChange.start('/test');
      expect(window.performance.mark).toHaveBeenCalledWith('route-/test-start');

      trackRouteChange.end('/test');
      expect(window.performance.mark).toHaveBeenCalledWith('route-/test-end');
      expect(window.performance.measure).toHaveBeenCalledWith(
        'route-change-/test',
        'route-/test-start',
        'route-/test-end'
      );
    });
  });

  describe('trackRender', () => {
    it('tracks component renders', () => {
      trackRender.start('TestComponent');
      expect(window.performance.mark).toHaveBeenCalledWith('render-TestComponent-start');

      trackRender.end('TestComponent');
      expect(window.performance.mark).toHaveBeenCalledWith('render-TestComponent-end');
      expect(window.performance.measure).toHaveBeenCalledWith(
        'render-TestComponent',
        'render-TestComponent-start',
        'render-TestComponent-end'
      );
    });
  });
});