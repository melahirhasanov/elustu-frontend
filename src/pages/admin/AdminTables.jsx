import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert, Box, Button, Card, Chip, InputAdornment, MenuItem, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api, { errorMessage } from "../../api/client";
import { STATUS } from "../../components/orders/orderStatus";
import { formatClock, formatDate } from "../../utils/date";
import { Stars } from "../../components/RatingBadge";

// Axtarış + səhifələmə ilə ümumi cədvəl yükləyicisi
function usePagedList(endpoint, params) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const key = JSON.stringify(params);

  useEffect(() => setPage(0), [key]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api.get(endpoint, { params: { ...JSON.parse(key), limit: rowsPerPage, skip: page * rowsPerPage } })
        .then(({ data }) => !cancelled && (setData(data), setError("")))
        .catch((e) => !cancelled && setError(errorMessage(e)))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [endpoint, key, page, rowsPerPage]);

  const replace = (item) => setData((d) => ({ ...d, items: d.items.map((x) => (x._id === item._id ? { ...x, ...item } : x)) }));

  const pagination = (
    <TablePagination
      component="div"
      count={data.total}
      page={page}
      onPageChange={(_, p) => setPage(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value));
        setPage(0);
      }}
      rowsPerPageOptions={[25, 50, 100]}
      labelRowsPerPage="Səhifədə:"
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
    />
  );
  return { data, loading, error, replace, pagination };
}

const SearchField = ({ value, onChange, placeholder }) => (
  <TextField
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    sx={{ maxWidth: 360 }}
    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
  />
);

// ---------- Sifarişlər ----------
export function AdminOrders() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, error, replace, pagination } = usePagedList("/api/admin/orders", { q: q || undefined, status: status || undefined });

  const cancel = async (order) => {
    if (!window.confirm("Bu sifariş admin tərəfindən ləğv edilsin? Hər iki tərəfə bildiriş gedəcək.")) return;
    try {
      const { data } = await api.patch(`/api/admin/orders/${order._id}/cancel`);
      replace(data);
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <SearchField value={q} onChange={setQ} placeholder="Müştəri, ünvan, təsvir..." />
        <TextField select size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ width: 200 }} SelectProps={{ displayEmpty: true }}>
          <MenuItem value="">Bütün statuslar</MenuItem>
          {Object.entries(STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
        </TextField>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tarix</TableCell>
                <TableCell>Müştəri</TableCell>
                <TableCell>Usta</TableCell>
                <TableCell>İş</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Qiymət</TableCell>
                <TableCell>Rəy</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
              {data.items.map((o) => (
                <TableRow key={o._id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(o.createdAt)}<br /><Typography variant="caption" color="text.secondary">{formatClock(o.createdAt)}</Typography></TableCell>
                  <TableCell>{o.customer.name}<br /><Typography variant="caption" color="text.secondary">{o.customer.email}</Typography></TableCell>
                  <TableCell>
                    {o.master ? <RouterLink to={`/usta/${o.master._id}`} target="_blank">{o.master.name} {o.master.surname}</RouterLink> : "—"}
                    <br /><Typography variant="caption" color="text.secondary">{o.category}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Tooltip title={`${o.description} — ${o.address}`}>
                      <Typography variant="body2" noWrap>{o.description}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell><Chip size="small" label={STATUS[o.status].label} color={STATUS[o.status].color} variant={STATUS[o.status].color === "default" ? "outlined" : "filled"} /></TableCell>
                  <TableCell align="right">{o.price != null ? `${o.price} AZN` : "—"}</TableCell>
                  <TableCell>{o.review?.rating ? <Stars value={o.review.rating} /> : "—"}</TableCell>
                  <TableCell>
                    {["pending", "accepted", "in_progress"].includes(o.status) && (
                      <Button size="small" color="error" onClick={() => cancel(o)}>Ləğv et</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.items.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>Sifariş tapılmadı</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination}
      </Card>
    </Box>
  );
}

// ---------- Ustalar ----------
export function AdminMasters() {
  const [q, setQ] = useState("");
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const { data, loading, error, replace, pagination } = usePagedList("/api/admin/masters", { q: q || undefined, blocked: onlyBlocked ? "1" : undefined });

  const patch = async (m, body, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      const { data } = await api.patch(`/api/admin/masters/${m._id}`, body);
      replace(data);
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
        <SearchField value={q} onChange={setQ} placeholder="Ad, email, telefon, ixtisas..." />
        <Stack direction="row" alignItems="center">
          <Switch checked={onlyBlocked} onChange={(e) => setOnlyBlocked(e.target.checked)} />
          <Typography variant="body2">Yalnız bloklananlar</Typography>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usta</TableCell>
                <TableCell>Əlaqə</TableCell>
                <TableCell>İxtisas / şəhər</TableCell>
                <TableCell>Reytinq</TableCell>
                <TableCell align="center">İş</TableCell>
                <TableCell align="center">Şikayət</TableCell>
                <TableCell>Sifariş qəbulu</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
              {data.items.map((m) => (
                <TableRow key={m._id} hover sx={{ bgcolor: m.isBlocked ? "#FEF2F2" : undefined }}>
                  <TableCell>
                    <RouterLink to={`/usta/${m._id}`} target="_blank">{m.name} {m.surname}</RouterLink>
                    {m.isBlocked && <Chip size="small" color="error" label="Bloklu" sx={{ ml: 1 }} />}
                    <br /><Typography variant="caption" color="text.secondary">{formatDate(m.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>{m.email}<br /><Typography variant="caption" color="text.secondary">+{m.phone}</Typography></TableCell>
                  <TableCell>{m.category}<br /><Typography variant="caption" color="text.secondary">{m.city}</Typography></TableCell>
                  <TableCell>{m.ratingCount ? `${m.ratingAvg.toFixed(1)} ★ (${m.ratingCount})` : "—"}</TableCell>
                  <TableCell align="center">{m.completedOrders || 0}</TableCell>
                  <TableCell align="center">{m.complaints ? <Chip size="small" color="warning" label={m.complaints} /> : 0}</TableCell>
                  <TableCell>
                    <Switch size="small" checked={m.isAvailable !== false} onChange={(e) => patch(m, { isAvailable: e.target.checked })} disabled={m.isBlocked} />
                  </TableCell>
                  <TableCell align="right">
                    {m.isBlocked ? (
                      <Button size="small" onClick={() => patch(m, { isBlocked: false })}>Blokdan çıxar</Button>
                    ) : (
                      <Button size="small" color="error" onClick={() => patch(m, { isBlocked: true }, `${m.name} ${m.surname} bloklansın? Xəritədən gizlənəcək və daxil ola bilməyəcək.`)}>Blokla</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.items.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>Usta tapılmadı</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination}
      </Card>
    </Box>
  );
}

// ---------- Müştərilər ----------
export function AdminCustomers() {
  const [q, setQ] = useState("");
  const { data, loading, error, replace, pagination } = usePagedList("/api/admin/customers", { q: q || undefined });

  const toggleBlock = async (u) => {
    if (!u.isBlocked && !window.confirm(`${u.username || u.email} bloklansın? Daxil ola bilməyəcək.`)) return;
    try {
      const { data } = await api.patch(`/api/admin/customers/${u._id}`, { isBlocked: !u.isBlocked });
      replace(data);
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}><SearchField value={q} onChange={setQ} placeholder="Ad və ya email..." /></Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Müştəri</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell align="center">Sifariş</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
              {data.items.map((u) => (
                <TableRow key={u._id} hover sx={{ bgcolor: u.isBlocked ? "#FEF2F2" : undefined }}>
                  <TableCell>{u.username || "—"} {u.isBlocked && <Chip size="small" color="error" label="Bloklu" sx={{ ml: 1 }} />}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phoneNumber ? `+${u.phoneNumber}` : "—"}</TableCell>
                  <TableCell align="center">{u.orders}</TableCell>
                  <TableCell align="right">
                    <Button size="small" color={u.isBlocked ? "primary" : "error"} onClick={() => toggleBlock(u)}>
                      {u.isBlocked ? "Blokdan çıxar" : "Blokla"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.items.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>Müştəri tapılmadı</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination}
      </Card>
    </Box>
  );
}
