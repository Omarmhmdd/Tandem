import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { ToastProvider, useToast } from './components/ui/Toast';
import { setToastHandler } from './utils/toast';
import { AuthProvider } from './contexts/AuthContext';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Make queryClient available globally for cache clearing
if (typeof window !== 'undefined') {
  (window as any).queryClient = queryClient;
}

// Component to initialize toast handler
const ToastInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  React.useEffect(() => {
    setToastHandler(showToast);
  }, [showToast]);
  
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ToastInitializer>
            <App />
          </ToastInitializer>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);