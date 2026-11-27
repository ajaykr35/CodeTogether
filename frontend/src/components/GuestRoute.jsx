// Sirf logged-out users ke liye (login aur register pages).
// Logged-in user ko seedha andar bhej deta hai.

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (user) {
    // Agar kisi protected page se aaye the, to wahin; warna Dashboard
    return <Navigate to={location.state?.from || "/dashboard"} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;