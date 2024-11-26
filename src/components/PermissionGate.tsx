import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: keyof ReturnType<typeof usePermissions>;
}

export default function PermissionGate({ children, permission }: PermissionGateProps) {
  const permissions = usePermissions();

  if (!permissions[permission]) {
    return null;
  }

  return <>{children}</>;
}