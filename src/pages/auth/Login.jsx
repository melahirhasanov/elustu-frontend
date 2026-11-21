import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { Alert, Button, IconButton, InputAdornment, Link, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { clearError, login, loginUsta } from "../../store/authSlice";
import AuthShell from "./AuthShell";

export default function Login() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const role = params.get("rol") === "usta" ? "master" : "customer";
  const { user, role: sessionRole, loading, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, role]);

  // Uğurlu girişdən sonra (və ya artıq daxil olubsa) gəldiyi səhifəyə qayıdır
  if (user) {
    const from = location.state?.from;
    return <Navigate to={from || (sessionRole === "master" ? "/profil" : "/")} replace />;
  }

  const submit = (e) => {
    e.preventDefault();
    const action = role === "master" ? loginUsta : login;
    dispatch(action({ email: email.trim(), password }));
  };

  return (
    <AuthShell title="Xoş gəlmisiniz" subtitle="Hesabınıza daxil olun">
      <Tabs
        value={role}
        onChange={(_, v) => setParams(v === "master" ? { rol: "usta" } : {}, { replace: true })}
        variant="fullWidth"
        sx={{ mb: 3, bgcolor: "#F1F5F9", borderRadius: 2.5, p: 0.5, minHeight: 0, "& .MuiTabs-indicator": { display: "none" } }}
      >
        {[["customer", "Müştəri"], ["master", "Usta"]].map(([value, label]) => (
          <Tab key={value} value={value} label={label} sx={{ minHeight: 40, borderRadius: 2, "&.Mui-selected": { bgcolor: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,.1)" } }} />
        ))}
      </Tabs>

      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Şifrə"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="Şifrəni göstər">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Link component={RouterLink} to="/sifre-berpa" variant="body2" sx={{ alignSelf: "flex-end" }}>
          Şifrəni unutmusunuz?
        </Link>
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? "Daxil olunur..." : "Daxil ol"}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Hesabınız yoxdur?{" "}
          <Link component={RouterLink} to={role === "master" ? "/qeydiyyat?rol=usta" : "/qeydiyyat"} fontWeight={600}>
            Qeydiyyatdan keçin
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
