import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Alert, Badge, Box, Button, Container, Skeleton, Snackbar, Stack, Tab, Tabs, Typography } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import api from "../api/client";
import socketService from "../api/socket";
import EmptyState from "../components/EmptyState";
import OrderCard from "../components/orders/OrderCard";
import ReviewDialog from "../components/orders/ReviewDialog";
import { ACTIVE_STATUSES } from "../components/orders/orderStatus";
import useOnlineIds from "../hooks/useOnlineIds";

export default function Orders() {
  const { role } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const onlineIds = useOnlineIds();
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState("active");
  const [reviewing, setReviewing] = useState(null);
  const [toast, setToast] = useState(location.state?.created ? "Sifariş ustaya göndərildi" : "");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get("/api/orders/mine")
      .then(({ data }) => {
        setOrders(data);
        setError("");
      })
      .catch(() => {
        setOrders((prev) => prev || []);
        setError("Sifarişlər yüklənmədi");
      });
  }, []);

  useEffect(() => {
    load();
    // Qarşı tərəf statusu dəyişəndə siyahını canlı yenilə
    socketService.on("order_updated", load);
    return () => socketService.off("order_updated", load);
  }, [load]);

  // "Sifariş göndərildi" bildirişini təkrar göstərməmək üçün state-i təmizlə
  useEffect(() => {
    if (location.state?.created) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const replace = (updated) => setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));

  const { active, history } = useMemo(() => {
    const list = orders || [];
    return {
      active: list.filter((o) => ACTIVE_STATUSES.includes(o.status)),
      history: list.filter((o) => !ACTIVE_STATUSES.includes(o.status)),
    };
  }, [orders]);

  const needsAction = role === "master" ? active.filter((o) => o.status === "pending").length : 0;
  const shown = tab === "active" ? active : history;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4">Sifarişlər</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {role === "master" ? "Müştərilərdən gələn sifarişləri idarə edin" : "Verdiyiniz sifarişlərin vəziyyəti"}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tab
          value="active"
          label={
            <Badge badgeContent={needsAction} color="secondary" sx={{ "& .MuiBadge-badge": { right: -14 } }}>
              Aktiv ({active.length})
            </Badge>
          }
        />
        <Tab value="history" label={`Tarixçə (${history.length})`} />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {orders === null ? (
        <Stack spacing={2}>
          {[0, 1].map((i) => <Skeleton key={i} variant="rounded" height={180} />)}
        </Stack>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<AssignmentOutlinedIcon />}
          title={tab === "active" ? "Aktiv sifariş yoxdur" : "Tarixçə boşdur"}
          text={
            role === "master"
              ? "Müştəri sizə sifariş verəndə burada görünəcək və bildiriş alacaqsınız."
              : "Xəritədən ustanı seçin və \"Sifariş ver\" düyməsinə basın."
          }
          action={role !== "master" && tab === "active" && <Button variant="contained" component={RouterLink} to="/">Usta tap</Button>}
        />
      ) : (
        <Stack spacing={2}>
          {shown.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              role={role}
              online={onlineIds.has(String(role === "master" ? order.customer.email : order.master?._id))}
              onChanged={replace}
              onReview={setReviewing}
            />
          ))}
        </Stack>
      )}

      {reviewing && (
        <ReviewDialog
          open
          order={reviewing}
          onClose={() => setReviewing(null)}
          onDone={(updated) => {
            replace(updated);
            setReviewing(null);
            setToast("Rəyiniz üçün təşəkkür edirik!");
          }}
        />
      )}

      <Box>
        <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity="success" variant="filled" onClose={() => setToast("")}>{toast}</Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
