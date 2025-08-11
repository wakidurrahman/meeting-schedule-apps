import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

import { apolloClient } from '@/apollo/client';
import '@/assets/scss/main.scss';
import ErrorBoundary from '@/components/molecules/error-boundary';
import GlobalToasts from '@/components/molecules/toast/GlobalToasts';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.render(
  <React.StrictMode>
    {/* Error Boundary */}
    <ErrorBoundary>
      {/* Apollo Provider */}
      <ApolloProvider client={apolloClient}>
        {/* Auth Provider */}
        <AuthProvider>
          {/* Toast Provider */}
          <ToastProvider>
            {/* Browser Router */}
            <BrowserRouter>
              {/* App */}
              <App />
              {/* Global Toasts */}
              <GlobalToasts />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
);
