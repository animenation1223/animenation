import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/httpClient';
import { useAuth } from '@/context/AuthContext';

// Routes that are always accessible, even during maintenance
const ALLOWED_ROUTES = [
  '/maintenance',
  '/login',
  '/admin/login',
  '/admin',
  '/admin/',
];

// Routes that start with these prefixes are accessible to admins during maintenance
const ADMIN_PREFIXES = [
  '/admin',
];

export default function MaintenanceGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const currentPath = location.pathname;

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => apiFetch('/api/site-settings'),
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    // Don't check while loading
    if (isLoading) return;

    // If maintenance mode is off, allow all routes
    if (!settings?.maintenanceMode) return;

    // Check if current route is always allowed
    if (ALLOWED_ROUTES.includes(currentPath)) return;

    // Check if current route starts with admin prefix
    const isAdminRoute = ADMIN_PREFIXES.some(prefix => currentPath.startsWith(prefix));

    // Allow admin routes if user is admin
    if (isAdminRoute && isAuthenticated && user?.role === 'admin') return;

    // Redirect to maintenance page for all other routes
    navigate('/maintenance', { replace: true });
  }, [settings, isLoading, currentPath, navigate, isAuthenticated, user]);

  // Show loading state while checking maintenance status
  if (isLoading) {
    return null;
  }

  // If maintenance mode is on and we're on maintenance page, show children
  if (settings?.maintenanceMode && currentPath === '/maintenance') {
    return children;
  }

  // Otherwise, show children normally
  return children;
}
