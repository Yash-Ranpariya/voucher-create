import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Login } from '../features/auth/Login';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { ParallaxBackground } from '../components/layout/ParallaxBackground';
import { DesignShowcase } from '../features/dashboard/DesignShowcase';
import { AppShell } from '../components/layout/AppShell';
import { SignatureUpload } from '../features/signature/SignatureUpload';
import { VoucherList } from '../features/vouchers/VoucherList';
import { VoucherForm } from '../features/vouchers/VoucherForm';
import { VoucherDetails } from '../features/vouchers/VoucherDetails';
import { DirectorVouchers } from '../features/vouchers/DirectorVouchers';
import { AccountsVouchers } from '../features/vouchers/AccountsVouchers';
import { Dashboard } from '../features/dashboard/Dashboard';

// Temporary dummy components for placeholders
const DashboardPlaceholder = ({ role }: { role: string }) => (
  <div className="p-8 text-white">
    <h1 className="text-3xl font-bold">{role} Dashboard</h1>
    <p>Welcome to your dashboard.</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: (
      <>
        <ParallaxBackground />
        <Login />
      </>
    )
  },
  {
    path: '/design',
    element: <AppShell><DesignShowcase /></AppShell>
  },
  {
    element: <ProtectedRoute allowedRoles={['EMPLOYEE']} />,
    children: [
      {
        path: '/employee',
        element: <AppShell><Outlet /></AppShell>, // Outlet is not imported here, wait, let's restructure this slightly.
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'vouchers', element: <VoucherList /> },
          { path: 'vouchers/new', element: <VoucherForm /> },
          { path: 'vouchers/:id', element: <VoucherDetails /> },
          { path: 'vouchers/:id/edit', element: <VoucherForm /> },
          { path: 'signature', element: <SignatureUpload /> },
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={['DIRECTOR']} />,
    children: [
      {
        path: '/director',
        element: <AppShell><Outlet /></AppShell>,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'pending', element: <DirectorVouchers view="pending" /> },
          { path: 'vouchers', element: <DirectorVouchers view="all" /> },
          { path: 'vouchers/:id', element: <VoucherDetails /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={['ACCOUNTS']} />,
    children: [
      {
        path: '/accounts',
        element: <AppShell><Outlet /></AppShell>,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'vouchers', element: <AccountsVouchers /> },
          { path: 'vouchers/:id', element: <VoucherDetails /> }
        ]
      }
    ]
  }
]);

// Helper Outlet import since it wasn't at the top
import { Outlet } from 'react-router-dom';

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
