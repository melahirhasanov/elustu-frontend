import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography,
} from "@mui/material";
import api, { errorMessage } from "../../api/client";
import LocationPicker from "../map/LocationPicker";
import UserAvatar from "../UserAvatar";
import { getCurrentPosition } from "../map/mapUtils";

// Sabahın saat 10:00-ı — datetime-local formatında standart vaxt
function defaultTime() {
  const d = new Date(Date.now() + 86400000);
  d.setHours(10, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OrderDialog({ open, master, onClose, initialPosition, initialDescription = "", initialAddress = "" }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultTime());
  const [position, setPosition] = useState(initialPosition || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setPosition(initialPosition || null);
    // Ana səhifədə yazılan problem və ünvan formaya ötürülür (istifadəçi artıq nəsə yazıbsa, toxunulmur)
    if (initialDescription) setDescription((d) => d || initialDescription);
    if (initialAddress) setAddress((a) => a || initialAddress);
    // Yer məlum deyilsə, brauzerdən soruşmağa çalış (səssiz)
    if (!initialPosition) getCurrentPosition().then(setPosition).catch(() => {});
  }, [open, initialPosition, initialDescription, initialAddress]);

  const submit = async () => {
    if (description.trim().length < 10) return setError("İşi bir az ətraflı təsvir edin (ən azı 10 simvol)");
    if (!address.trim()) return setError("Ünvanı yazın");
    setSaving(true);
    setError("");
    try {
      await api.post("/api/orders", {
        masterId: master._id,
        description: description.trim(),
        address: address.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        ...(position ? { latitude: position[0], longitude: position[1] } : {}),
      });
      setDescription("");
      setAddress("");
      onClose();
      navigate("/sifarisler", { state: { created: true } });
    } catch (e) {
      setError(errorMessage(e, "Sifariş göndərilmədi"));
    } finally {
      setSaving(false);
    }
  };

  if (!master) return null;
  const fullName = `${master.name} ${master.surname}`;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Sifariş ver</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, bgcolor: "surface.subtle", borderRadius: 3 }}>
            <UserAvatar name={fullName} src={master.profileImage} size={44} />
            <Box>
              <Typography variant="subtitle2">{fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{master.category}</Typography>
            </Box>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nə iş görülməlidir?"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="məs. Mətbəxdə kran sızır, dəyişdirilməlidir. Kran məndədir."
            inputProps={{ maxLength: 1000 }}
          />
          <TextField label="Ünvan" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Küçə, bina, mənzil" />
          <TextField
            label="Nə vaxt gəlsin?"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <LocationPicker value={position} onChange={setPosition} height={220} label={position ? "Ustanın gələcəyi yer" : "Xəritədə yeri göstərin (istəyə görə)"} />
          <Typography variant="caption" color="text.secondary">
            Sifariş ustaya dərhal çatır. Usta qəbul edəndə qiyməti və detalları sizinlə razılaşdıracaq.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">Ləğv et</Button>
        <Button onClick={submit} variant="contained" disabled={saving}>{saving ? "Göndərilir..." : "Sifarişi göndər"}</Button>
      </DialogActions>
    </Dialog>
  );
}
