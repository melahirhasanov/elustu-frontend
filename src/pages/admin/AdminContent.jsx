import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Card, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import api, { errorMessage } from "../../api/client";
import { Stars } from "../../components/RatingBadge";
import { formatClock, formatDate } from "../../utils/date";
import { SearchField, usePagedList } from "./AdminTables";

async function remove(url, question, reload) {
  if (!window.confirm(question)) return;
  try {
    await api.delete(url);
    reload();
  } catch (e) {
    window.alert(errorMessage(e));
  }
}

// Sadə siyahı cədvəli
function Rows({ list, head, row, empty }) {
  return (
    <>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow>{head.map((h, i) => <TableCell key={i}>{h}</TableCell>)}</TableRow></TableHead>
            <TableBody sx={{ opacity: list.loading ? 0.5 : 1 }}>
              {list.data.items.map(row)}
              {!list.loading && !list.data.items.length && <TableRow><TableCell colSpan={head.length} align="center" sx={{ py: 4, color: "text.secondary" }}>{empty}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        {list.pagination}
      </Card>
    </>
  );
}

const Person = ({ m }) => (m ? <RouterLink to={`/usta/${m._id}`} target="_blank" style={{ color: "inherit" }}>{m.name} {m.surname}</RouterLink> : "silinib");

export function AdminPosts() {
  const [q, setQ] = useState("");
  const [demo, setDemo] = useState("0");
  const list = usePagedList("/api/admin/posts", { q: q || undefined, demo });
  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <SearchField value={q} onChange={setQ} placeholder="Başlıq və ya təsvir..." />
        <TextField select size="small" label="Növ" value={demo} onChange={(e) => setDemo(e.target.value)} sx={{ maxWidth: 190 }}>
          <MenuItem value="0">Nümunəsiz</MenuItem>
          <MenuItem value="1">Nümunələrlə</MenuItem>
        </TextField>
      </Stack>
      <Rows list={list} head={["Media", "Paylaşım", "Usta", "Tarix", ""]} empty="Paylaşım yoxdur" row={(p) => (
        <TableRow key={p._id} hover>
          <TableCell>
            {p.media?.startsWith("https://") && p.mediaType !== "video" ? (
              <Box component="img" src={p.media} alt="" loading="lazy" sx={{ width: 64, height: 48, objectFit: "cover", borderRadius: 1.5, bgcolor: "surface.subtle" }} />
            ) : (
              <Typography variant="caption" color="text.secondary">{p.mediaType === "video" ? "Video" : "Köhnə fayl"}</Typography>
            )}
          </TableCell>
          <TableCell sx={{ maxWidth: 360 }}>
            <Typography variant="subtitle2" noWrap>{p.title}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>{p.description}</Typography>
          </TableCell>
          <TableCell><Person m={p.user} /></TableCell>
          <TableCell>{formatDate(p.createdAt)}</TableCell>
          <TableCell align="right"><Button size="small" color="error" onClick={() => remove(`/api/admin/posts/${p._id}`, "Paylaşım birdəfəlik silinsin?", list.reload)}>Sil</Button></TableCell>
        </TableRow>
      )} />
    </Box>
  );
}

export function AdminReviews() {
  const [rating, setRating] = useState("0");
  const list = usePagedList("/api/admin/reviews", { rating });
  return (
    <Box>
      <TextField select size="small" label="Qiymət" value={rating} onChange={(e) => setRating(e.target.value)} sx={{ mb: 2, maxWidth: 180 }}>
        <MenuItem value="0">Hamısı</MenuItem>
        {["5", "4", "3", "2", "1"].map((n) => <MenuItem key={n} value={n}>{n} ulduz</MenuItem>)}
      </TextField>
      <Rows list={list} head={["Qiymət", "Rəy", "Müştəri", "Usta", "Tarix", ""]} empty="Rəy yoxdur" row={(o) => (
        <TableRow key={o._id} hover>
          <TableCell><Stars value={o.review.rating} /></TableCell>
          <TableCell sx={{ maxWidth: 360 }}>{o.review.comment || "—"}</TableCell>
          <TableCell>{o.customer.name}</TableCell>
          <TableCell><Person m={o.master} /></TableCell>
          <TableCell>{formatDate(o.review.createdAt)}</TableCell>
          <TableCell align="right"><Button size="small" color="error" onClick={() => remove(`/api/admin/reviews/${o._id}`, "Rəy silinsin? Ustanın reytinqi yenidən hesablanacaq.", list.reload)}>Sil</Button></TableCell>
        </TableRow>
      )} />
    </Box>
  );
}

export function AdminLogs() {
  const list = usePagedList("/api/admin/logs", {});
  return (
    <Rows list={list} head={["Vaxt", "Admin", "Əməliyyat", "Hədəf", "Təfərrüat"]} empty="Jurnal boşdur" row={(l) => (
      <TableRow key={l._id} hover>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(l.createdAt)} {formatClock(l.createdAt)}</TableCell>
        <TableCell>{l.admin?.name}</TableCell>
        <TableCell>{l.action}</TableCell>
        <TableCell>{l.target}</TableCell>
        <TableCell sx={{ maxWidth: 360, overflowWrap: "anywhere" }}><Typography variant="caption">{l.details}</Typography></TableCell>
      </TableRow>
    )} />
  );
}
