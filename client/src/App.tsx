import { paths } from '@/constants/paths';
import { useAuthContext } from '@/context/AuthContext';
import CalendarPage from '@/pages/calendar';
import CreateMeeting from '@/pages/create-meeting';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import Profile from '@/pages/profile';
import Register from '@/pages/register';
import UsersPage from '@/pages/users';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const pathsLink = paths;

/**
 * Private Route
 * Protects the route from unauthorized access
 * @param {JSX.Element} children - The children to render
 * @returns {JSX.Element} The private route
 */
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? children : <Navigate to={pathsLink.login} replace />;
}

/**
 * App
 * @returns {JSX.Element} The app
 */
export default function App(): JSX.Element {
  return (
    <Routes>
      <Route
        path={pathsLink.home}
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.createMeeting}
        element={
          <PrivateRoute>
            <CreateMeeting />
          </PrivateRoute>
        }
      />
      <Route path={pathsLink.login} element={<Login />} />
      <Route path={pathsLink.register} element={<Register />} />
      <Route
        path={pathsLink.profile}
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.users}
        element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.calendar}
        element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
