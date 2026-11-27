// Sirf logged-in users ke liye. Logged-out user ko /login par bhejta hai,
// aur yaad rakhta hai ki wo kahan jaana chahta tha (login ke baad wahin wapas).

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Page abhi khula hai aur token check ho raha hai: tab tak intezaar,
  // warna logged-in user bhi ek pal ke liye login page par chala jata
  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Sab theek: andar ka page dikhao
  return <Outlet />;
}

export default ProtectedRoute;