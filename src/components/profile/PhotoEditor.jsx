import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import api, { errorMessage } from "../../api/client";
import { updateUser } from "../../store/authSlice";
import UserAvatar from "../UserAvatar";

const MAX_MB = 5;

// Öz profil şəklini qoymaq, dəyişmək və silmək (usta və müştəri)
export default function PhotoEditor({ name, src, size = 112, sx, onChange }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (request) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await request();
      const profileImage = data.profileImage || undefined;
      dispatch(updateUser({ profileImage }));
      onChange?.(profileImage);
    } catch (e) {
      setError(errorMessage(e, "Şəkil yüklənmədi"));
    } finally {
      setBusy(false);
    }
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // eyni faylı yenidən seçmək mümkün olsun
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("JPG, PNG və ya WEBP şəkil seçin");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Şəkil ${MAX_MB} MB-dan böyük olmamalıdır`);
    const form = new FormData();
    form.append("photo", file);
    run(() => api.put("/api/profile/photo", form));
  };

  return (
    <Box sx={{ width: "fit-content", textAlign: "center", ...sx }}>
      <Box sx={{ position: "relative", width: size, mx: "auto" }}>
        <UserAvatar name={name} src={src} size={size} sx={{ border: "4px solid #fff", boxShadow: "0 8px 24px rgba(15,23,42,.15)", opacity: busy ? 0.5 : 1 }} />
        {busy && <CircularProgress size={32} sx={{ position: "absolute", inset: 0, m: "auto" }} />}
        <Tooltip title={src ? "Şəkli dəyiş" : "Profil şəkli əlavə et"}>
          <IconButton
            size="small"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            aria-label="Profil şəklini dəyiş"
            sx={{ position: "absolute", right: 0, bottom: 0, bgcolor: "primary.main", color: "primary.contrastText", border: "2px solid #fff", "&:hover": { bgcolor: "primary.dark" } }}
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} aria-label="Profil şəkli faylı" />
      {src && !busy && (
        <Button size="small" color="inherit" onClick={() => window.confirm("Profil şəkli silinsin?") && run(() => api.delete("/api/profile/photo"))} sx={{ mt: 0.5, color: "text.secondary" }}>
          Şəkli sil
        </Button>
      )}
      {error && <Typography variant="caption" color="error" sx={{ display: "block", maxWidth: 180 }}>{error}</Typography>}
    </Box>
  );
}
