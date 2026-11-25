import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Alert, Button, Stack, TextField } from "@mui/material";
import api, { errorMessage } from "../../api/client";
import AuthShell from "./AuthShell";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError("Şifrə ən azı 8 simvol olmalıdır");
    if (password !== password2) return setError("Şifrələr eyni deyil");
    setSaving(true);
    setError("");
    try {
      await api.post(`/api/auth/reset-password/${token}`, { newPassword: password });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, "Şifrə yenilənmədi"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthShell title="Yeni şifrə" subtitle="Hesabınız üçün yeni şifrə təyin edin" maxWidth="sm" wide>
      {done ? (
        <Stack spacing={2}>
          <Alert severity="success">Şifrəniz yeniləndi. İndi yeni şifrə ilə daxil ola bilərsiniz.</Alert>
          <Button variant="contained" size="large" component={RouterLink} to="/giris">Daxil ol</Button>
        </Stack>
      ) : (
        <Stack component="form" spacing={2} onSubmit={submit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Yeni şifrə" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          <TextField label="Yeni şifrəni təkrarlayın" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required autoComplete="new-password" />
          <Button type="submit" variant="contained" size="large" disabled={saving}>
            {saving ? "Saxlanılır..." : "Şifrəni yenilə"}
          </Button>
        </Stack>
      )}
    </AuthShell>
  );
}
