import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import MapHome from "./pages/MapHome";

// Xəritə və chat ağır modullardır — yalnız açılanda yüklənir
const About = lazy(() => import("./pages/Home"));
const Masters = lazy(() => import("./pages/Masters"));
const Orders = lazy(() => import("./pages/Orders"));
const MasterProfile = lazy(() => import("./pages/MasterProfile"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));

function Loading() {
  return (
    <Box sx={{ flex: 1, display: "grid", placeItems: "center", py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

// Köhnə /ustamin-profili/:id linkləri yeni ünvana yönləndirilir
function LegacyMasterRedirect() {
  const { id } = useParams();
  return <Navigate to={`/usta/${id}`} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="haqqimizda" element={<About />} />
          <Route path="ustalar" element={<Masters />} />
          <Route path="usta/:id" element={<MasterProfile />} />
          <Route path="giris" element={<Login />} />
          <Route path="qeydiyyat" element={<Register />} />
          <Route path="sifre-berpa" element={<ForgotPassword />} />
          <Route path="new-password/:token" element={<ResetPassword />} />
          <Route path="admin/giris" element={<AdminLogin />} />
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="profil" element={<MyProfile />} />
            <Route path="sifarisler" element={<Orders />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Xəritə və chat bütün ekranı tutur, footer-siz */}
        <Route element={<MainLayout hideFooter />}>
          <Route index element={<MapHome />} />
          <Route element={<ProtectedRoute />}>
            <Route path="mesajlar" element={<Messages />} />
          </Route>
        </Route>

        {/* Köhnə ünvanlar */}
        <Route path="usta-secim" element={<Navigate to="/ustalar" replace />} />
        <Route path="login" element={<Navigate to="/giris" replace />} />
        <Route path="usta-login" element={<Navigate to="/giris?rol=usta" replace />} />
        <Route path="signup" element={<Navigate to="/qeydiyyat" replace />} />
        <Route path="usta-register" element={<Navigate to="/qeydiyyat?rol=usta" replace />} />
        <Route path="reset" element={<Navigate to="/sifre-berpa" replace />} />
        <Route path="chat" element={<Navigate to="/mesajlar" replace />} />
        <Route path="ustachat" element={<Navigate to="/mesajlar" replace />} />
        <Route path="usta-profile" element={<Navigate to="/profil" replace />} />
        <Route path="ustamin-profili/:id" element={<LegacyMasterRedirect />} />
      </Routes>
    </Suspense>
  );
}
