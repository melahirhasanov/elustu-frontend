import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Alert, Button, Card, FormControlLabel, Grid, Skeleton, Stack, Switch, TextField, Typography } from "@mui/material";
import api, { errorMessage } from "../../api/client";
import { logout } from "../../store/authSlice";

const SWITCHES = [
  ["ordersEnabled", "Sifariş qəbulu", "Söndürülsə, yeni sifariş verilə bilməz"],
  ["registrationEnabled", "Yeni qeydiyyat", "Söndürülsə, yeni usta və müştəri qeydiyyatdan keçə bilməz"],
  ["showDemo", "Nümunə profillər", "Söndürülsə, nümunələr saytda görünmür (bazada qalır)"],
];
const MAIL = { brevo: "Brevo (HTTPS) ilə göndərilir.", smtp: "Gmail SMTP. Render-in pulsuz planında bu işləmir, BREVO_API_KEY lazımdır." };

export default function AdminSettings() {
  const dispatch = useDispatch();
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  useEffect(() => {
    api.get("/api/admin/settings").then(({ data }) => setS(data)).catch((e) => setMsg(["error", errorMessage(e)]));
  }, []);

  const run = async (fn, text) => {
    try {
      const { data } = await fn();
      setMsg(["success", text || data.message]);
      return data;
    } catch (e) {
      setMsg(["error", errorMessage(e)]);
    }
  };
  const save = async (update) => {
    const data = await run(() => api.put("/api/admin/settings", update), "Yadda saxlanıldı");
    if (data) setS(data);
  };
  const changePassword = async (e) => {
    e.preventDefault();
    if (await run(() => api.put("/api/admin/password", pw))) setTimeout(() => dispatch(logout()), 1500);
  };

  return (
    <Stack spacing={3} useFlexGap>
      {msg && <Alert severity={msg[0]} onClose={() => setMsg(null)}>{msg[1]}</Alert>}
      {!s ? <Skeleton variant="rounded" height={240} /> : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>Saytın rejimi</Typography>
              {SWITCHES.map(([key, label, hint]) => (
                <FormControlLabel
                  key={key}
                  sx={{ display: "flex", mb: 1 }}
                  control={<Switch checked={s[key]} onChange={(e) => save({ [key]: e.target.checked })} />}
                  label={<><Typography sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="caption" color="text.secondary">{hint}</Typography></>}
                />
              ))}
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>Elan</Typography>
              <TextField
                multiline minRows={3} value={s.announcement} inputProps={{ maxLength: 300, "aria-label": "Elan mətni" }}
                onChange={(e) => setS({ ...s, announcement: e.target.value })}
                placeholder="Bayram günləri cavab gecikə bilər"
                helperText={`${s.announcement.length}/300 — bütün səhifələrin yuxarısında görünür`}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center">
                <FormControlLabel control={<Switch checked={s.announcementActive} onChange={(e) => setS({ ...s, announcementActive: e.target.checked })} />} label="Göstər" />
                <Button variant="contained" onClick={() => save({ announcement: s.announcement, announcementActive: s.announcementActive })}>Saxla</Button>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>Email</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{MAIL[s.mail] || "Qurulmayıb: şifrə bərpası emaili göndərilmir."}</Typography>
              <Button variant="outlined" onClick={() => run(() => api.post("/api/admin/mail/test"))}>Özümə sınaq emaili göndər</Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card component="form" sx={{ p: 3, height: "100%" }} onSubmit={changePassword}>
              <Typography variant="h6" gutterBottom>Admin şifrəm</Typography>
              <Stack spacing={1.5}>
                <TextField size="small" type="password" label="Cari şifrə" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
                <TextField size="small" type="password" label="Yeni şifrə (ən azı 10 simvol)" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
                <Button type="submit" variant="outlined">Şifrəni dəyiş</Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
