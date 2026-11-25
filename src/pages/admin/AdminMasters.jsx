import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert, Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Paper, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import api, { errorMessage } from "../../api/client";
import DemoChip from "../../components/DemoChip";
import { CATEGORIES, CITIES } from "../../constants/data";
import { formatDate } from "../../utils/date";
import { SearchField, usePagedList } from "./AdminTables";
import { downloadCsv, showResetLink } from "./adminUtils";

const KEYS = ["name", "surname", "phone", "city", "category", "bio", "experience"];

function EditDialog({ master, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  useEffect(() => {
    if (!master) return;
    setError("");
    setForm(Object.fromEntries(KEYS.map((k) => [k, master[k] ?? ""])));
  }, [master]);
  if (!master) return null;
  const field = (key, label, props) => <TextField label={label} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />;

  const save = async () => {
    // Yalnız dəyişən sahələr göndərilir
    const changed = Object.fromEntries(Object.entries(form).filter(([k, v]) => String(v) !== String(master[k] ?? "")));
    if (!Object.keys(changed).length) return onClose();
    try {
      const { data } = await api.put(`/api/admin/masters/${master._id}`, changed);
      onSaved(data);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ustanı redaktə et</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={6}>{field("name", "Ad")}</Grid>
          <Grid item xs={6}>{field("surname", "Soyad")}</Grid>
          <Grid item xs={6}>{field("phone", "Telefon")}</Grid>
          <Grid item xs={6}>{field("experience", "Təcrübə (il)", { type: "number" })}</Grid>
          <Grid item xs={6}>{field("category", "İxtisas", { select: true, children: CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>) })}</Grid>
          <Grid item xs={6}>{field("city", "Şəhər", { select: true, children: [...new Set([form.city, ...CITIES])].filter(Boolean).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>) })}</Grid>
          <Grid item xs={12}>{field("bio", "Haqqında", { multiline: true, minRows: 3 })}</Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>Ləğv et</Button>
        <Button variant="contained" onClick={save}>Saxla</Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteDialog({ items, onClose, onConfirm }) {
  const [text, setText] = useState("");
  useEffect(() => setText(""), [items]);
  return (
    <Dialog open={Boolean(items)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{items?.length} usta silinsin?</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>Profillər və paylaşımlar birdəfəlik silinir, geri qaytarmaq olmur. Sifariş tarixçəsi qalır. Aktiv sifarişi olan usta silinmir.</Alert>
        <Typography variant="body2" sx={{ mb: 2, maxHeight: 120, overflowY: "auto" }}>{items?.map((m) => `${m.name} ${m.surname}`).join(", ")}</Typography>
        <TextField size="small" label="Təsdiq üçün SİL yazın" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>Ləğv et</Button>
        <Button color="error" variant="contained" disabled={!["sil", "sıl"].includes(text.trim().toLocaleLowerCase("az"))} onClick={onConfirm}>Birdəfəlik sil</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminMasters() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("real");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(new Map());
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const { data, loading, error, replace, pagination, reload } = usePagedList("/api/admin/masters", {
    q: q || undefined, category: category || undefined, type: type === "blocked" ? undefined : type || undefined, blocked: type === "blocked" ? "1" : undefined,
  });
  useEffect(() => setSelected(new Map()), [q, type, category]);

  const toggle = (m) => setSelected((prev) => {
    const next = new Map(prev);
    if (!next.delete(m._id)) next.set(m._id, m);
    return next;
  });
  const allOnPage = data.items.length > 0 && data.items.every((m) => selected.has(m._id));
  const toggleAll = () => setSelected((prev) => {
    const next = new Map(prev);
    data.items.forEach((m) => (allOnPage ? next.delete(m._id) : next.set(m._id, m)));
    return next;
  });

  const bulk = async (action, list = [...selected.values()]) => {
    try {
      const { data: r } = await api.post("/api/admin/masters/bulk", { action, ids: list.map((m) => m._id) });
      setNotice(`${r.done} usta üçün icra olundu${r.skipped ? `, ${r.skipped} usta aktiv sifarişi olduğu üçün saxlanıldı` : ""}.`);
      setSelected(new Map());
      reload();
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };
  const patch = async (m, body) => {
    try {
      const { data: r } = await api.patch(`/api/admin/masters/${m._id}`, body);
      replace(r);
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <SearchField value={q} onChange={setQ} placeholder="Ad, email, telefon, şəhər..." />
        <TextField select size="small" label="Növ" value={type} onChange={(e) => setType(e.target.value)} sx={{ maxWidth: { sm: 170 } }}>
          <MenuItem value="real">Real ustalar</MenuItem>
          <MenuItem value="demo">Nümunələr</MenuItem>
          <MenuItem value="blocked">Bloklananlar</MenuItem>
          <MenuItem value="all">Hamısı</MenuItem>
        </TextField>
        <TextField select size="small" label="İxtisas" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ maxWidth: { sm: 220 } }}>
          <MenuItem value="">Bütün ixtisaslar</MenuItem>
          {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={() => downloadCsv("ustalar", data.items, ["name", "surname", "email", "phone", "category", "city", "ratingAvg", "completedOrders", "isBlocked", "isDemo"])}>CSV</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>{notice}</Alert>}
      {selected.size > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, mb: 2, position: "sticky", top: 76, zIndex: 3, bgcolor: "surface.tint" }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>{selected.size} seçildi</Typography>
            <Button size="small" variant="outlined" onClick={() => bulk("hide")}>Gizlət</Button>
            <Button size="small" variant="outlined" onClick={() => bulk("show")}>Göstər</Button>
            <Button size="small" variant="outlined" color="warning" onClick={() => window.confirm("Seçilənlər bloklansın?") && bulk("block")}>Blokla</Button>
            <Button size="small" variant="outlined" onClick={() => bulk("unblock")}>Blokdan çıxar</Button>
            <Button size="small" variant="contained" color="error" onClick={() => setDeleting([...selected.values()])}>Sil</Button>
            <Button size="small" color="inherit" onClick={() => setSelected(new Map())}>Seçimi təmizlə</Button>
          </Stack>
        </Paper>
      )}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox checked={allOnPage} indeterminate={!allOnPage && data.items.some((m) => selected.has(m._id))} onChange={toggleAll} inputProps={{ "aria-label": "Səhifədəkilərin hamısını seç" }} /></TableCell>
                <TableCell>Usta</TableCell><TableCell>Əlaqə</TableCell><TableCell>İxtisas / şəhər</TableCell><TableCell>Reytinq</TableCell>
                <TableCell align="center">İş</TableCell><TableCell align="center">Şikayət</TableCell><TableCell>Sifariş qəbulu</TableCell><TableCell />
              </TableRow>
            </TableHead>
            <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
              {data.items.map((m) => (
                <TableRow key={m._id} hover selected={selected.has(m._id)} sx={{ bgcolor: m.isBlocked ? "surface.danger" : undefined }}>
                  <TableCell padding="checkbox"><Checkbox checked={selected.has(m._id)} onChange={() => toggle(m)} inputProps={{ "aria-label": `${m.name} ${m.surname} seç` }} /></TableCell>
                  <TableCell>
                    <RouterLink to={`/usta/${m._id}`} target="_blank" style={{ color: "inherit", fontWeight: 600 }}>{m.name} {m.surname}</RouterLink>{" "}
                    {m.isDemo && <DemoChip />} {m.isBlocked && <Chip size="small" color="error" label="Bloklu" />}
                    <br /><Typography variant="caption" color="text.secondary">{formatDate(m.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>{m.email}<br /><Typography variant="caption" color="text.secondary">{m.phone}</Typography></TableCell>
                  <TableCell>{m.category}<br /><Typography variant="caption" color="text.secondary">{m.city}</Typography></TableCell>
                  <TableCell>{m.ratingCount ? `${m.ratingAvg.toFixed(1)} ★ (${m.ratingCount})` : "—"}</TableCell>
                  <TableCell align="center">{m.completedOrders || 0}</TableCell>
                  <TableCell align="center">{m.complaints ? <Chip size="small" color="warning" label={m.complaints} /> : 0}</TableCell>
                  <TableCell><Switch size="small" checked={m.isAvailable !== false} disabled={m.isBlocked} onChange={(e) => patch(m, { isAvailable: e.target.checked })} /></TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Redaktə et"><IconButton size="small" onClick={() => setEditing(m)} aria-label="Redaktə et"><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                    {!m.isDemo && <Tooltip title="Şifrə bərpa linki"><IconButton size="small" onClick={() => showResetLink(`/api/admin/masters/${m._id}/reset-link`)} aria-label="Şifrə bərpa linki"><KeyOutlinedIcon fontSize="small" /></IconButton></Tooltip>}
                    <Button size="small" color={m.isBlocked ? "primary" : "error"} onClick={() => (m.isBlocked || window.confirm(`${m.name} ${m.surname} bloklansın?`)) && patch(m, { isBlocked: !m.isBlocked })}>{m.isBlocked ? "Blokdan çıxar" : "Blokla"}</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.items.length === 0 && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>Usta tapılmadı</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination}
      </Card>
      <EditDialog master={editing} onClose={() => setEditing(null)} onSaved={(m) => { replace(m); setEditing(null); }} />
      <DeleteDialog items={deleting} onClose={() => setDeleting(null)} onConfirm={() => { bulk("delete", deleting); setDeleting(null); }} />
    </Box>
  );
}
