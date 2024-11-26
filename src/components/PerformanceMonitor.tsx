import React, { useEffect } from 'react';
import { trackRender } from '../lib/monitoring';

interface PerformanceMonitorProps {
  id: string;
  children: React.ReactNode;
}

export default function PerformanceMonitor({ id, children }: PerformanceMonitorProps) {
  useEffect(() => {
    trackRender.start(id);
    return () => {
      trackRender.end(id);
    };
  }, [id]);

  return <>{children}</>;
}