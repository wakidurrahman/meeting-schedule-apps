import { apolloClient } from '@/apollo/client';
import '@/assets/scss/main.scss';
import ErrorBoundary from '@/components/molecules/error-boundary';
import { AuthProvider } from '@/context/AuthContext';
import { ApolloProvider } from '@apollo/client';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    {/* Error Boundary */}
    <ErrorBoundary>
      {/* Apollo Provider */}
      <ApolloProvider client={apolloClient}>
        {/* Auth Provider */}
        <AuthProvider>
          {/* Browser Router */}
          <BrowserRouter>
            {/* App */}
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
