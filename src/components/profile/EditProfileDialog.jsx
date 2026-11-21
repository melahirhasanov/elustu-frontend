import { useEffect, useState } from "react";
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography,
} from "@mui/material";
import api, { errorMessage } from "../../api/client";
import { CATEGORIES, CITIES } from "../../constants/data";
import LocationPicker from "../map/LocationPicker";
import { masterLatLng } from "../map/mapUtils";

const toForm = (m) => ({
  name: m.name || "",
  surname: m.surname || "",
  phone: m.phone || "",
  city: m.city || "",
  category: m.category || "",
  experience: m.experience || 0,
  bio: m.bio || "",
});

export default function EditProfileDialog({ open, master, onClose, onSaved }) {
  const [form, setForm] = useState(toForm(master));
  const [position, setPosition] = useState(masterLatLng(master));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(toForm(master));
      setPosition(masterLatLng(master));
      setError("");
    }
  }, [open, master]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.surname.trim() || !form.phone.trim()) {
      setError("Ad, soyad və telefon boş ola bilməz");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, experience: Number(form.experience) || 0 };
      if (position) {
        payload.latitude = position[0];
        payload.longitude = position[1];
      }
      const { data } = await api.put("/api/master/me", payload);
      onSaved(data);
    } catch (e) {
      setError(errorMessage(e, "Profil yadda saxlanmadı"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Profili redaktə et</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Ad" value={form.name} onChange={set("name")} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Soyad" value={form.surname} onChange={set("surname")} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Telefon" value={form.phone} onChange={set("phone")} helperText="Ölkə kodu ilə, məs. 994501234567" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Təcrübə (il)" type="number" inputProps={{ min: 0, max: 70 }} value={form.experience} onChange={set("experience")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select label="İxtisas" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select label="Şəhər" value={form.city} onChange={set("city")}>
              {(CITIES.includes(form.city) || !form.city ? CITIES : [form.city, ...CITIES]).map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Haqqımda"
              multiline
              minRows={3}
              value={form.bio}
              onChange={set("bio")}
              inputProps={{ maxLength: 600 }}
              helperText={`${form.bio.length}/600 — hansı işləri görürsünüz, hansı ərazilərə gedirsiniz`}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>İş yeri</Typography>
            <LocationPicker value={position} onChange={setPosition} height={240} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">Ləğv et</Button>
        <Button onClick={save} variant="contained" disabled={saving}>
          {saving ? "Saxlanılır..." : "Yadda saxla"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
