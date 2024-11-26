import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, RequireAuth } from './lib/auth';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import ErrorDashboard from './pages/admin/ErrorDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import Unauthorized from './pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('Authentication')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth><Layout /></RequireAuth>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { 
        path: 'rooms', 
        element: <RequireAuth allowedRoles={['super_admin', 'hotel_admin', 'staff']}>
          <Rooms />
        </RequireAuth>
      },
      { path: 'bookings', element: <Bookings /> },
      { 
        path: 'analytics', 
        element: <RequireAuth allowedRoles={['super_admin', 'hotel_admin']}>
          <Analytics />
        </RequireAuth>
      },
      { path: 'settings', element: <Settings /> },
      { 
        path: 'admin/errors', 
        element: <RequireAuth allowedRoles={['super_admin']}>
          <ErrorDashboard />
        </RequireAuth>
      },
      {
        path: 'ad45120as1245',
        element: <RequireAuth allowedRoles={['super_admin']}>
          <SuperAdminDashboard />
        </RequireAuth>
      },
    ],
  },
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
  { path: 'reset-password', element: <ResetPassword /> },
  { path: 'unauthorized', element: <Unauthorized /> },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}