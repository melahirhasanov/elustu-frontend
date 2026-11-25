import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Button, Card, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, Stack, Step, StepLabel, Stepper, TextField, Tooltip, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import ComplaintDialog from "../complaints/ComplaintDialog";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import api, { errorMessage } from "../../api/client";
import UserAvatar from "../UserAvatar";
import { Stars } from "../RatingBadge";
import CallButton from "../../calls/CallButton";
import MastersMap from "../map/MastersMap";
import { formatClock, formatDate } from "../../utils/date";
import { ACTIONS, STATUS } from "./orderStatus";
import LiveTracking from "./LiveTracking";
import useShareLocation from "../../hooks/useShareLocation";

const FLOW = ["pending", "accepted", "on_the_way", "in_progress", "completed"];

export default function OrderCard({ order, role, online, onChanged, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [priceDialog, setPriceDialog] = useState(false);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [complaintOpen, setComplaintOpen] = useState(false);

  const isMaster = role === "master";
  const status = STATUS[order.status];
  const master = order.master || {};
  // Qarşı tərəf: usta üçün müştəri, müştəri üçün usta
  const other = isMaster
    ? { id: order.customer.email, name: order.customer.name, sub: "Müştəri" }
    : { id: master._id, name: `${master.name || ""} ${master.surname || ""}`.trim(), sub: order.category };
  const roomId = `${order.customer.email}_${master._id}`;
  const actions = ACTIONS[role]?.[order.status] || [];
  const finished = ["rejected", "cancelled"].includes(order.status);
  const location = order.location?.coordinates?.length === 2 ? order.location : null;
  const onTheWay = order.status === "on_the_way";
  // Usta "Yola çıxdım" deyəndə yeri müştəriyə canlı göndərilir (səhifə açıq olduqca)
  const sharing = useShareLocation(order._id, isMaster && onTheWay);

  const changeStatus = async (to, extra = {}) => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/api/orders/${order._id}/status`, { status: to, ...extra });
      onChanged(data);
    } catch (e) {
      window.alert(errorMessage(e, "Əməliyyat alınmadı"));
    } finally {
      setBusy(false);
    }
  };

  const runAction = (action) => {
    if (action.askPrice) return setPriceDialog(true);
    if (action.confirm && !window.confirm(action.confirm)) return;
    changeStatus(action.to);
  };

  return (
    <Card sx={{ overflow: "visible" }}>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <UserAvatar name={other.name} src={isMaster ? undefined : master.profileImage} size={48} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" noWrap>{other.name}</Typography>
              <Chip size="small" label={status.label} color={status.color} variant={status.color === "default" ? "outlined" : "filled"} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {other.sub} · {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <IconButton onClick={() => setExpanded((v) => !v)} aria-label="Ətraflı" sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
            <ExpandMoreIcon />
          </IconButton>
        </Stack>

        <Typography sx={{ mt: 1.5, whiteSpace: "pre-line" }}>{order.description}</Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 1.5, color: "text.secondary" }} flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PlaceOutlinedIcon fontSize="small" />
            <Typography variant="body2">{order.address}</Typography>
          </Stack>
          {order.scheduledAt && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ScheduleIcon fontSize="small" />
              <Typography variant="body2">{formatDate(order.scheduledAt)}, {formatClock(order.scheduledAt)}</Typography>
            </Stack>
          )}
          {order.price != null && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "primary.main" }}>
              <PaymentsOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.price} AZN</Typography>
            </Stack>
          )}
        </Stack>
        {order.masterNote && (
          <Typography variant="body2" sx={{ mt: 1, p: 1.25, bgcolor: "#F1F5F9", borderRadius: 2 }}>
            <b>Ustanın qeydi:</b> {order.masterNote}
          </Typography>
        )}

        {onTheWay && (
          <Box sx={{ mt: 2 }}>
            {isMaster && (
              <Typography variant="caption" sx={{ display: "block", mb: 1, color: sharing === "denied" ? "error.main" : "text.secondary" }}>
                {sharing === "denied" ? "Yer icazəsi verilməyib — müştəri sizi xəritədə görə bilmir." : "Yeriniz müştəriyə canlı göndərilir. Çatanda “Çatdım, işə başla” düyməsinə basın."}
              </Typography>
            )}
            <LiveTracking order={order} />
          </Box>
        )}

        {order.review?.rating && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <Stars value={order.review.rating} />
            {order.review.comment && <Typography variant="body2" color="text.secondary">“{order.review.comment}”</Typography>}
          </Stack>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap alignItems="center">
          {actions.map((a) => (
            <Button key={a.to} variant={a.variant} color={a.color || "primary"} onClick={() => runAction(a)} disabled={busy} size="small">
              {a.label}
            </Button>
          ))}
          {!isMaster && order.status === "completed" && !order.review?.rating && (
            <Button variant="contained" color="secondary" size="small" onClick={() => onReview(order)}>Rəy yaz</Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Problem bildir (şikayət)">
            <IconButton onClick={() => setComplaintOpen(true)} sx={{ color: "text.secondary" }}>
              <ReportOutlinedIcon />
            </IconButton>
          </Tooltip>
          {!finished && (
            <>
              <Tooltip title="Mesaj yaz">
                <IconButton component={RouterLink} to={isMaster ? `/mesajlar?otaq=${encodeURIComponent(roomId)}` : `/mesajlar?usta=${master._id}`} color="primary">
                  <ChatBubbleOutlineIcon />
                </IconButton>
              </Tooltip>
              <CallButton iconOnly peerId={other.id} peerName={other.name} online={online} />
            </>
          )}
        </Stack>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <Divider />
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {!finished ? (
            <Stepper activeStep={FLOW.indexOf(order.status) + (order.status === "completed" ? 1 : 0)} alternativeLabel sx={{ mb: 2 }}>
              {FLOW.map((s) => (
                <Step key={s}><StepLabel>{STATUS[s].label}</StepLabel></Step>
              ))}
            </Stepper>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 2 }}>{status.hint}</Typography>
          )}
          <Stack spacing={0.5} sx={{ mb: location ? 2 : 0 }}>
            {(order.history || []).map((h, i) => (
              <Typography key={i} variant="caption" color="text.secondary">
                {formatDate(h.at)} {formatClock(h.at)} — {STATUS[h.status]?.label} ({h.by === "master" ? "usta" : "müştəri"})
              </Typography>
            ))}
          </Stack>
          {location && (
            <Box sx={{ height: 200 }}>
              <MastersMap
                masters={[{ _id: `order_${order._id}`, name: order.customer.name, surname: "", category: order.category, location }]}
              />
            </Box>
          )}
        </Box>
      </Collapse>

      <ComplaintDialog open={complaintOpen} onClose={() => setComplaintOpen(false)} orderId={order._id} targetName={other.name} />

      {/* Usta qəbul edərkən qiymət və qeyd (istəyə görə) */}
      <Dialog open={priceDialog} onClose={() => setPriceDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sifarişi qəbul et</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Təxmini qiymət (AZN)" type="number" inputProps={{ min: 0 }} value={price} onChange={(e) => setPrice(e.target.value)} helperText="İstəyə görə — sonra da razılaşa bilərsiniz" />
            <TextField label="Müştəriyə qeyd" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="məs. Saat 10-da orada olacağam" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPriceDialog(false)} color="inherit">Ləğv et</Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={async () => {
              await changeStatus("accepted", { price: price === "" ? undefined : Number(price), masterNote: note.trim() || undefined });
              setPriceDialog(false);
            }}
          >
            Qəbul et
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
