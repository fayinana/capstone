
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import LoaderFallback from './components/LoaderFallback';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Suspense fallback={<LoaderFallback />}>
      <App />
    </Suspense>
  </ErrorBoundary>
);
