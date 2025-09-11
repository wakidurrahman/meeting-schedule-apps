import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Calendar  = lazy(() => import("./pages/Calendar"));
const Users     = lazy(() => import("./pages/Users"));
const Profile   = lazy(() => import("./pages/Profile"));

const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/calendar", element: <Calendar /> },
  { path: "/users", element: <Users /> },
  { path: "/profile", element: <Profile /> },
]);

export default function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
