import { RouterProvider } from 'react-router-dom';
import { invalidateLocalSession } from '../features/auth';
import { configureUnauthorizedHandler } from '../shared/api/httpClient';
import { AppProviders } from './providers';
import { queryClient } from './queryClient';
import { router } from './router';

let handlingUnauthorized = false;

configureUnauthorizedHandler(() => {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;
  invalidateLocalSession();
  queryClient.clear();
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const destination = window.location.pathname === '/login'
    ? '/login'
    : `/login?returnTo=${encodeURIComponent(returnTo)}`;
  void router.navigate(destination, { replace: true }).finally(() => {
    handlingUnauthorized = false;
  });
});

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
