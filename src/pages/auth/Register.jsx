import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useSearchParams } from "react-router-dom";
import {
  Alert, Button, Divider, Grid, InputAdornment, Link, MenuItem, Stack, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import { clearError, login, loginUsta, register, registerUsta } from "../../store/authSlice";
import { CATEGORIES, CITIES } from "../../constants/data";
import LocationPicker from "../../components/map/LocationPicker";
import AuthShell from "./AuthShell";

const EMPTY = { name: "", surname: "", email: "", phone: "", password: "", password2: "", city: "", category: "" };

// Telefon "+994" prefiksi ilə daxil edilir, bazada rəqəmlər kimi (994XXXXXXXXX) saxlanılır
const phoneDigits = (v) => v.replace(/\D/g, "").slice(0, 9);

export default function Register() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const role = params.get("rol") === "usta" ? "master" : "customer";
  const { user, role: sessionRole, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState(EMPTY);
  const [position, setPosition] = useState(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(clearError());
    setLocalError("");
  }, [dispatch, role]);

  if (user) return <Navigate to={sessionRole === "master" ? "/profil" : "/"} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: key === "phone" ? phoneDigits(e.target.value) : e.target.value }));

  const validate = () => {
    if (form.password.length < 6) return "Şifrə ən azı 6 simvol olmalıdır";
    if (form.password !== form.password2) return "Şifrələr eyni deyil";
    if (role === "master") {
      if (form.phone.length !== 9) return "Telefon nömrəsini tam daxil edin (9 rəqəm)";
      if (!form.city || !form.category) return "Şəhər və ixtisası seçin";
      if (!position) return "Xəritədə iş yerinizi seçin";
    }
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    setLocalError(problem);
    if (problem) return;

    const email = form.email.trim();
    let result;
    if (role === "master") {
      result = await dispatch(registerUsta({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email,
        phone: `994${form.phone}`,
        password: form.password,
        city: form.city,
        category: form.category,
        latitude: position[0],
        longitude: position[1],
      }));
    } else {
      result = await dispatch(register({
        username: form.name.trim(),
        email,
        password: form.password,
        ...(form.phone ? { phoneNumber: Number(`994${form.phone}`) } : {}),
      }));
    }
    // Qeydiyyat uğurludursa, istifadəçini avtomatik daxil edirik
    if (!result.error) {
      dispatch((role === "master" ? loginUsta : login)({ email, password: form.password }));
    }
  };

  const shownError = localError || error;

  return (
    <AuthShell
      title={role === "master" ? "Usta kimi qoşulun" : "Hesab yaradın"}
      subtitle={role === "master" ? "Pulsuz profil yaradın və müştərilərdən mesaj alın" : "Ustalara yazmaq üçün qısa qeydiyyat"}
      wide={role === "master"}
    >
      <Tabs
        value={role}
        onChange={(_, v) => setParams(v === "master" ? { rol: "usta" } : {}, { replace: true })}
        variant="fullWidth"
        sx={{ mb: 3, bgcolor: "#F1F5F9", borderRadius: 2.5, p: 0.5, minHeight: 0, "& .MuiTabs-indicator": { display: "none" } }}
      >
        {[["customer", "Müştəriyəm"], ["master", "Ustayam"]].map(([value, label]) => (
          <Tab key={value} value={value} label={label} sx={{ minHeight: 40, borderRadius: 2, "&.Mui-selected": { bgcolor: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,.1)" } }} />
        ))}
      </Tabs>

      <Stack component="form" spacing={2} onSubmit={submit} noValidate>
        {shownError && <Alert severity="error">{shownError}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={role === "master" ? 6 : 12}>
            <TextField label={role === "master" ? "Ad" : "Adınız"} value={form.name} onChange={set("name")} required autoComplete="given-name" />
          </Grid>
          {role === "master" && (
            <Grid item xs={12} sm={6}>
              <TextField label="Soyad" value={form.surname} onChange={set("surname")} required autoComplete="family-name" />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField label="Email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={role === "master" ? "Telefon" : "Telefon (istəyə görə)"}
              value={form.phone}
              onChange={set("phone")}
              required={role === "master"}
              placeholder="501234567"
              inputMode="numeric"
              InputProps={{ startAdornment: <InputAdornment position="start">+994</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Şifrə" type="password" value={form.password} onChange={set("password")} required autoComplete="new-password" helperText="Ən azı 6 simvol" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Şifrəni təkrarlayın" type="password" value={form.password2} onChange={set("password2")} required autoComplete="new-password" />
          </Grid>

          {role === "master" && (
            <>
              <Grid item xs={12}><Divider><Typography variant="caption" color="text.secondary">İş məlumatları</Typography></Divider></Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="İxtisas" value={form.category} onChange={set("category")} required>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Şəhər" value={form.city} onChange={set("city")} required>
                  {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <LocationPicker value={position} onChange={setPosition} height={260} />
              </Grid>
            </>
          )}
        </Grid>

        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? "Gözləyin..." : role === "master" ? "Usta kimi qeydiyyatdan keç" : "Qeydiyyatdan keç"}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Artıq hesabınız var?{" "}
          <Link component={RouterLink} to={role === "master" ? "/giris?rol=usta" : "/giris"} fontWeight={600}>
            Daxil olun
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
