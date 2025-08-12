import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { paths } from '@/constants/paths';
import { useAuthContext } from '@/context/AuthContext';
import BookingsPage from '@/pages/bookings';
import CalendarPage from '@/pages/calendar';
import CreateMeeting from '@/pages/create-meeting';
import Dashboard from '@/pages/dashboard';
import EventsPage from '@/pages/events';
import CreateEventPage from '@/pages/events/create';
import EditEventPage from '@/pages/events/edit';
import Login from '@/pages/login';
import Profile from '@/pages/profile';
import Register from '@/pages/register';
import UsersPage from '@/pages/users';

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
