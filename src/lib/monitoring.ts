import { errorHandler } from './error';

// Performance monitoring
export const performance = {
  mark(name: string) {
    if (typeof window !== 'undefined') {
      window.performance.mark(name);
    }
  },

  measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined') {
      try {
        const measure = window.performance.measure(name, startMark, endMark);
        console.debug(`Performance measure ${name}:`, measure.duration.toFixed(2), 'ms');
        return measure.duration;
      } catch (error) {
        errorHandler.handle(error, { context: 'performance.measure', name, startMark, endMark });
      }
    }
    return 0;
  },

  clearMarks() {
    if (typeof window !== 'undefined') {
      window.performance.clearMarks();
    }
  },
};

// Route change performance tracking
export const trackRouteChange = {
  start(route: string) {
    performance.mark(`route-${route}-start`);
  },

  end(route: string) {
    performance.mark(`route-${route}-end`);
    performance.measure(
      `route-change-${route}`,
      `route-${route}-start`,
      `route-${route}-end`
    );
  },
};

// Component render tracking
export const trackRender = {
  start(componentName: string) {
    performance.mark(`render-${componentName}-start`);
  },

  end(componentName: string) {
    performance.mark(`render-${componentName}-end`);
    return performance.measure(
      `render-${componentName}`,
      `render-${componentName}-start`,
      `render-${componentName}-end`
    );
  },
};