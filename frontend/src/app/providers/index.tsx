import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { queryClient } from '../../lib/queryClient';
import { router } from '../router';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { PWAInstallPrompt } from '../../components/PWAInstallPrompt';

export function AppProviders() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <PWAInstallPrompt />
          {(import.meta as any).env?.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
