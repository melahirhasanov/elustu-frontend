import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating, Stack, TextField, Typography } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import api, { errorMessage } from "../../api/client";

const LABELS = { 1: "Çox pis", 2: "Pis", 3: "Normal", 4: "Yaxşı", 5: "Əla" };

export default function ReviewDialog({ open, order, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post(`/api/orders/${order._id}/review`, { rating, comment });
      onDone(data);
    } catch (e) {
      setError(errorMessage(e, "Rəy göndərilmədi"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Ustanı qiymətləndirin</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}
          <Rating
            value={rating}
            onChange={(_, v) => v && setRating(v)}
            onChangeActive={(_, v) => setHover(v)}
            size="large"
            icon={<StarRoundedIcon fontSize="inherit" />}
            emptyIcon={<StarRoundedIcon fontSize="inherit" />}
            sx={{ fontSize: 44, color: "secondary.main" }}
          />
          <Typography sx={{ fontWeight: 600 }}>{LABELS[hover !== -1 ? hover : rating]}</Typography>
          <TextField
            label="Rəyiniz (istəyə görə)"
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: 500 }}
            placeholder="Usta vaxtında gəldimi, iş keyfiyyətli oldumu?"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>Sonra</Button>
        <Button onClick={submit} variant="contained" disabled={saving}>Göndər</Button>
      </DialogActions>
    </Dialog>
  );
}
