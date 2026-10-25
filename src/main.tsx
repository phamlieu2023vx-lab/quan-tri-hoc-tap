import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ErrorBoundary>
);
