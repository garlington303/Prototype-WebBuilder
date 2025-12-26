import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { PageLoader } from '@/components/PageLoader';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'

// Lazy load the builder for better performance (only loaded when accessed)
const BuilderPage = lazy(() => import('@/pages/admin/BuilderPage').then(module => ({ default: module.BuilderPage })));

const router = createBrowserRouter([
  {
    // Public route - RetroDiffusion AI Image Generation App
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    // Hidden admin/builder route - password protected
    path: "/___ddsdebugdevstudio",
    element: (
      <Suspense fallback={<PageLoader />}>
        <BuilderPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    // Catch-all for builder sub-routes
    path: "/___ddsdebugdevstudio/*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <BuilderPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);

// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)
