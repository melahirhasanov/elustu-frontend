import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Alert, Box, Button, Card, Container, Stack, TextField, Typography } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { clearError, loginAdmin } from "../../store/authSlice";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const { user, role, loading, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (user && role === "admin") return <Navigate to="/admin" replace />;

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Card sx={{ p: 4 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "#0F172A", color: "#fff", display: "grid", placeItems: "center", mb: 2 }}>
          <AdminPanelSettingsOutlinedIcon />
        </Box>
        <Typography variant="h5">Admin girişi</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Yalnız platforma administratorları üçün</Typography>
        {user && role !== "admin" && (
          <Alert severity="info" sx={{ mb: 2 }}>Hazırda adi hesabla daxil olmusunuz. Admin kimi daxil olsanız, həmin sessiya bağlanacaq.</Alert>
        )}
        <Stack
          component="form"
          spacing={2}
          onSubmit={(e) => {
            e.preventDefault();
            dispatch(loginAdmin({ email: email.trim(), password }));
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          <TextField label="Şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ bgcolor: "#0F172A", "&:hover": { bgcolor: "#1E293B" } }}>
            {loading ? "Daxil olunur..." : "Daxil ol"}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
