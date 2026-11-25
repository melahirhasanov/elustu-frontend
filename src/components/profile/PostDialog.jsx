import { useEffect, useRef, useState } from "react";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, TextField, Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import api, { errorMessage } from "../../api/client";

const MAX_SIZE = 50 * 1024 * 1024;

export default function PostDialog({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setFile(null);
      setProgress(null);
      setError("");
    }
  }, [open]);

  // Önizləmə URL-ni yaddaşdan təmizlə
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (f) => {
    if (!f) return;
    if (!/^(image|video)\//.test(f.type)) return setError("Yalnız şəkil və ya video yükləyə bilərsiniz");
    if (f.size > MAX_SIZE) return setError("Fayl 50 MB-dan böyük olmamalıdır");
    setError("");
    setFile(f);
  };

  const submit = async () => {
    if (!title.trim() || !description.trim() || !file) {
      setError("Başlıq, təsvir və media faylı tələb olunur");
      return;
    }
    const data = new FormData();
    data.append("title", title.trim());
    data.append("description", description.trim());
    data.append("media", file);
    setProgress(0);
    setError("");
    try {
      await api.post("/api/post/post", data, {
        onUploadProgress: (e) => e.total && setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onCreated();
    } catch (e) {
      setError(errorMessage(e, "Paylaşım göndərilmədi"));
      setProgress(null);
    }
  };

  const uploading = progress !== null;
  const isVideo = file?.type.startsWith("video/");

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni paylaşım</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0]);
            }}
            sx={{
              border: 2, borderStyle: "dashed", borderColor: file ? "primary.main" : "divider", borderRadius: 3,
              cursor: "pointer", overflow: "hidden", bgcolor: "surface.subtle", minHeight: 200,
              display: "grid", placeItems: "center", textAlign: "center",
            }}
          >
            {preview ? (
              isVideo ? (
                <video src={preview} style={{ width: "100%", maxHeight: 320 }} muted controls />
              ) : (
                <Box component="img" src={preview} alt="" sx={{ width: "100%", maxHeight: 320, objectFit: "contain" }} />
              )
            ) : (
              <Box sx={{ p: 3, color: "text.secondary" }}>
                <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />
                <Typography sx={{ fontWeight: 600, color: "text.primary" }}>Şəkil və ya video seçin</Typography>
                <Typography variant="body2">Klikləyin və ya faylı bura atın · maks. 50 MB</Typography>
              </Box>
            )}
          </Box>
          <input ref={inputRef} type="file" accept="image/*,video/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          <TextField label="Başlıq" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="məs. Hamam kranının dəyişdirilməsi" />
          <TextField label="Təsvir" multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nə iş görüldü, nə qədər vaxt çəkdi..." />
          {uploading && (
            <Box>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary">Yüklənir: {progress}%</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={uploading} color="inherit">Ləğv et</Button>
        <Button onClick={submit} variant="contained" disabled={uploading}>Paylaş</Button>
      </DialogActions>
    </Dialog>
  );
}
