import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackRouteChange } from '../lib/monitoring';

export function usePerformanceMonitoring() {
  const location = useLocation();

  useEffect(() => {
    const route = location.pathname;
    trackRouteChange.start(route);

    return () => {
      trackRouteChange.end(route);
    };
  }, [location.pathname]);
}