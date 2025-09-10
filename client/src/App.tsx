import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { paths, pathsWithAuth } from '@/constants/paths';
import { useAuthContext } from '@/context/AuthContext';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import BookingsPage from '@/pages/bookings';
import CalendarPage from '@/pages/calendar';
import EditMeetingPage from '@/pages/calendar/edit/[id]';
import Dashboard from '@/pages/dashboard';
import EventsPage from '@/pages/events';
import CreateEventPage from '@/pages/events/create';
import EditEventPage from '@/pages/events/edit';
import Profile from '@/pages/profile';
import UsersPage from '@/pages/users';
import UserDetailPage from '@/pages/users/[id]';
import EditUserPage from '@/pages/users/[id]/edit';
import CreateUserPage from '@/pages/users/create';

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
 * TODO: Bundle Size
 * Current: No code splitting implemented
 * Impact: Large initial bundle download
 * Solution: Route-based code splitting
 */

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

      <Route path={pathsLink.login} element={<Login />} />
      <Route path={pathsLink.register} element={<Register />} />
      <Route
        path={pathsWithAuth.profile}
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.events}
        element={
          <PrivateRoute>
            <EventsPage />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.eventCreate}
        element={
          <PrivateRoute>
            <CreateEventPage />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.eventEdit}
        element={
          <PrivateRoute>
            <EditEventPage />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.bookings}
        element={
          <PrivateRoute>
            <BookingsPage />
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
        path={pathsLink.userCreate}
        element={
          <PrivateRoute>
            <CreateUserPage />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.userEdit}
        element={
          <PrivateRoute>
            <EditUserPage />
          </PrivateRoute>
        }
      />
      <Route
        path={pathsLink.userDetail}
        element={
          <PrivateRoute>
            <UserDetailPage />
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
      <Route
        path="/calendar/edit/:id"
        element={
          <PrivateRoute>
            <EditMeetingPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
