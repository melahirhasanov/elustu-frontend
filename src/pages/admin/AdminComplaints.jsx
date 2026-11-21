import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert, Box, Button, Card, Chip, Collapse, MenuItem, Skeleton, Stack, TextField, Typography,
} from "@mui/material";
import api, { errorMessage } from "../../api/client";
import EmptyState from "../../components/EmptyState";
import { COMPLAINT_REASONS, COMPLAINT_STATUS } from "../../components/complaints/complaintLabels";
import { STATUS } from "../../components/orders/orderStatus";
import { formatClock, formatDate } from "../../utils/date";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";

function ComplaintItem({ complaint, onUpdated, onBlockMaster }) {
  const [open, setOpen] = useState(complaint.status === "open");
  const [note, setNote] = useState(complaint.adminNote || "");
  const [busy, setBusy] = useState(false);
  const st = COMPLAINT_STATUS[complaint.status];

  const update = async (status) => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/api/admin/complaints/${complaint._id}`, { status, adminNote: note.trim() });
      onUpdated(data);
    } catch (e) {
      window.alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ p: 2.5, borderLeft: 4, borderLeftColor: complaint.status === "open" ? "error.main" : "divider" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} onClick={() => setOpen((v) => !v)} sx={{ cursor: "pointer" }}>
        <Box>
          <Typography variant="subtitle1">{COMPLAINT_REASONS[complaint.reason]}</Typography>
          <Typography variant="body2" color="text.secondary">
            <b>{complaint.reporter.name}</b> ({complaint.reporter.role === "master" ? "usta" : "müştəri"}) →{" "}
            <b>{complaint.target.name}</b> ({complaint.target.type === "master" ? "usta" : "müştəri"})
          </Typography>
          <Typography variant="caption" color="text.secondary">{formatDate(complaint.createdAt)}, {formatClock(complaint.createdAt)}</Typography>
        </Box>
        <Chip label={st.label} color={st.color} size="small" sx={{ alignSelf: { sm: "flex-start" } }} />
      </Stack>

      <Collapse in={open}>
        <Typography sx={{ mt: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2, whiteSpace: "pre-line" }}>{complaint.description}</Typography>
        {complaint.order && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sifariş: {complaint.order.category} — “{complaint.order.description?.slice(0, 80)}” · status: <b>{STATUS[complaint.order.status]?.label}</b>
          </Typography>
        )}
        {complaint.reporter.email && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>Şikayətçinin emaili: {complaint.reporter.email}</Typography>
        )}
        <TextField
          label="Cavab / qeyd (şikayətçi görəcək)"
          multiline
          minRows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mt: 2 }}
          size="small"
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          {complaint.status === "open" && <Button size="small" variant="outlined" disabled={busy} onClick={() => update("in_review")}>Baxılır</Button>}
          <Button size="small" variant="contained" color="success" disabled={busy} onClick={() => update("resolved")}>Həll edildi</Button>
          <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={() => update("rejected")}>Rədd et</Button>
          <Box sx={{ flex: 1 }} />
          {complaint.target.type === "master" && (
            <>
              <Button size="small" component={RouterLink} to={`/usta/${complaint.target.id}`} target="_blank">Ustanın profili</Button>
              <Button size="small" color="error" disabled={busy} onClick={() => onBlockMaster(complaint.target)}>Ustanı blokla</Button>
            </>
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}

export default function AdminComplaints() {
  const [status, setStatus] = useState("open");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setData(null);
    api.get("/api/admin/complaints", { params: { status: status || undefined } })
      .then(({ data }) => setData(data))
      .catch((e) => {
        setError(errorMessage(e));
        setData({ items: [], total: 0 });
      });
  }, [status]);

  useEffect(load, [load]);

  const blockMaster = async (target) => {
    if (!window.confirm(`${target.name} bloklansın? Usta xəritədən gizlənəcək və daxil ola bilməyəcək.`)) return;
    try {
      await api.patch(`/api/admin/masters/${target.id}`, { isBlocked: true });
      window.alert("Usta bloklandı");
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField select size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ width: 200 }}>
          <MenuItem value="">Hamısı</MenuItem>
          {Object.entries(COMPLAINT_STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
        </TextField>
        <Typography color="text.secondary">{data ? `${data.total} şikayət` : ""}</Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {data === null ? (
        <Stack spacing={2}>{[0, 1].map((i) => <Skeleton key={i} variant="rounded" height={110} />)}</Stack>
      ) : data.items.length === 0 ? (
        <EmptyState icon={<ReportOutlinedIcon />} title="Şikayət yoxdur" text="Bu statusda şikayət tapılmadı." />
      ) : (
        <Stack spacing={2}>
          {data.items.map((c) => (
            <ComplaintItem
              key={c._id}
              complaint={c}
              onBlockMaster={blockMaster}
              onUpdated={(u) => setData((d) => ({ ...d, items: d.items.map((x) => (x._id === u._id ? u : x)) }))}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
