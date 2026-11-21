import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Daxil olmayan istifadəçini girişə, səhv roldakını ana səhifəyə yönləndirir
export default function ProtectedRoute({ role }) {
  const { user, role: currentRole } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to={role === "admin" ? "/admin/giris" : "/giris"} replace state={{ from: location.pathname + location.search }} />;
  }
  if (role && currentRole !== role) {
    return <Navigate to={role === "admin" ? "/admin/giris" : "/"} replace />;
  }
  return <Outlet />;
}
