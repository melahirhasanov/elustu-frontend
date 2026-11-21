import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Button, Link, Stack, TextField } from "@mui/material";
import api, { errorMessage } from "../../api/client";
import AuthShell from "./AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: "", text: "" });
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email: email.trim() });
      setStatus({ type: "success", text: data.message || "Bərpa linki emailinizə göndərildi" });
    } catch (err) {
      setStatus({ type: "error", text: errorMessage(err, "Email göndərilmədi") });
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell title="Şifrəni bərpa et" subtitle="Hesabınızın emailini yazın, sizə bərpa linki göndərək" maxWidth="sm" wide>
      <Stack component="form" spacing={2} onSubmit={submit}>
        {status.text && <Alert severity={status.type}>{status.text}</Alert>}
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Button type="submit" variant="contained" size="large" disabled={sending}>
          {sending ? "Göndərilir..." : "Bərpa linki göndər"}
        </Button>
        <Link component={RouterLink} to="/giris" variant="body2" textAlign="center">Girişə qayıt</Link>
      </Stack>
    </AuthShell>
  );
}
