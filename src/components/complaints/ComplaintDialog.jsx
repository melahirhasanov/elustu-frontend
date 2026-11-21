import { useState } from "react";
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography,
} from "@mui/material";
import api, { errorMessage } from "../../api/client";
import { COMPLAINT_REASONS } from "./complaintLabels";


// Şikayət: profildən (masterId) və ya sifarişdən (orderId). Admin paneldə baxılır.
export default function ComplaintDialog({ open, onClose, masterId, orderId, targetName }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const close = () => {
    onClose();
    setTimeout(() => {
      setReason("");
      setDescription("");
      setError("");
      setDone(false);
    }, 200);
  };

  const submit = async () => {
    if (!reason) return setError("Səbəbi seçin");
    if (description.trim().length < 10) return setError("Problemi bir az ətraflı yazın (ən azı 10 simvol)");
    setSaving(true);
    setError("");
    try {
      await api.post("/api/complaints", { masterId, orderId, reason, description: description.trim() });
      setDone(true);
    } catch (e) {
      setError(errorMessage(e, "Şikayət göndərilmədi"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : close} maxWidth="sm" fullWidth>
      <DialogTitle>Şikayət et{targetName ? `: ${targetName}` : ""}</DialogTitle>
      <DialogContent dividers>
        {done ? (
          <Alert severity="success">
            Şikayətiniz qəbul edildi. Administrator baxıb lazımi tədbir görəcək. Statusu “Profilim” bölməsində izləyə bilərsiniz.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2" color="text.secondary">Nə baş verdi?</Typography>
            <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
              {Object.entries(COMPLAINT_REASONS).map(([value, label]) => (
                <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={label} />
              ))}
            </RadioGroup>
            <TextField
              label="Ətraflı yazın"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              inputProps={{ maxLength: 1500 }}
              placeholder="Nə vaxt, necə oldu? Bu, administratorun qərar verməsinə kömək edəcək."
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {done ? (
          <Button variant="contained" onClick={close}>Bağla</Button>
        ) : (
          <>
            <Button onClick={close} color="inherit" disabled={saving}>Ləğv et</Button>
            <Button onClick={submit} variant="contained" color="error" disabled={saving}>Göndər</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
