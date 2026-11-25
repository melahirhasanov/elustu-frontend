import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box, Button, Card, Chip, Container, FormControlLabel, Grid, Skeleton, Stack, Switch, Typography,
} from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RatingBadge from "../RatingBadge";
import ReviewsSection from "../reviews/ReviewsSection";
import CallButton from "../../calls/CallButton";
import OrderDialog from "../orders/OrderDialog";
import useOnlineIds from "../../hooks/useOnlineIds";
import ComplaintDialog from "../complaints/ComplaintDialog";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import api from "../../api/client";
import DemoChip from "../DemoChip";
import PhotoEditor from "./PhotoEditor";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import EmptyState from "../EmptyState";
import MastersMap from "../map/MastersMap";
import { masterLatLng } from "../map/mapUtils";
import PostCard from "./PostCard";
import { formatMonthYear } from "../../utils/date";

function InfoRow({ icon, children }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: "text.secondary" }}>
      {icon}
      <Typography variant="body2" color="text.primary">{children}</Typography>
    </Stack>
  );
}

// Usta profilinin ortaq görünüşü: ictimai səhifə (isOwner=false) və "Profilim" (isOwner=true)
export default function MasterProfileView({ master, isOwner, onEdit, onPhotoChange, onAddPost, postsVersion = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useSelector((s) => s.auth);
  const onlineIds = useOnlineIds();
  const online = onlineIds.has(master._id);
  const [orderOpen, setOrderOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [available, setAvailable] = useState(master.isAvailable !== false);
  const canOrder = available && !master.isBusy;

  // Usta "sifariş qəbul edirəm" rejimini dəyişir — söndürülübsə xəritədə görünmür
  const toggleAvailable = async (value) => {
    setAvailable(value);
    try {
      await api.put("/api/master/me/availability", { isAvailable: value });
    } catch {
      setAvailable(!value);
    }
  };
  const [posts, setPosts] = useState(null);
  const [likes, setLikes] = useState({});
  const fullName = `${master.name} ${master.surname}`;
  const position = masterLatLng(master);

  useEffect(() => {
    api
      .get("/api/post/post", { params: { userId: master._id } })
      .then(({ data }) => {
        const list = data.data || [];
        setPosts(list);
        const initial = {};
        for (const p of list) {
          const ids = (p.likes || []).map(String);
          initial[p._id] = { count: ids.length, liked: Boolean(user?.id) && ids.includes(String(user.id)) };
        }
        setLikes(initial);
      })
      .catch(() => setPosts([]));
  }, [master._id, user?.id, postsVersion]);

  const openOrder = () => {
    if (!user) return navigate("/giris", { state: { from: location.pathname } });
    setOrderOpen(true);
  };

  const toggleLike = async (postId) => {
    if (!user) return navigate("/giris");
    try {
      const { data } = await api.post(`/api/post/${postId}/like`);
      setLikes((prev) => ({ ...prev, [postId]: { count: data.likesCount, liked: data.liked } }));
    } catch {
      /* şəbəkə xətası — vəziyyət dəyişmir */
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Bu postu silmək istəyirsiniz?")) return;
    try {
      await api.delete(`/api/post/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      window.alert("Post silinmədi, yenidən cəhd edin.");
    }
  };

  return (
    <Box>
      {/* Örtük + əsas məlumat */}
      <Box sx={{ height: { xs: 110, md: 150 }, background: "linear-gradient(120deg, #0F766E 0%, #14B8A6 60%, #F59E0B 140%)" }} />
      <Container maxWidth="lg" sx={{ mt: { xs: -7, md: -9 }, pb: 6 }}>
        <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "flex-end" }}>
            {isOwner ? (
              <PhotoEditor name={fullName} src={master.profileImage} onChange={onPhotoChange} sx={{ mt: { md: -8 } }} />
            ) : (
              <UserAvatar name={fullName} src={master.profileImage} size={112} sx={{ border: "4px solid #fff", boxShadow: "0 8px 24px rgba(15,23,42,.15)", mt: { md: -8 } }} />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4">{fullName}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main", mt: 0.5 }}>
                <CategoryIcon category={master.category} fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>{master.category}</Typography>
              </Stack>
              <Box sx={{ mt: 0.75 }}>{master.isDemo ? <DemoChip /> : <RatingBadge master={master} size="medium" />}</Box>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <Chip size="small" icon={<PlaceOutlinedIcon />} label={master.city} variant="outlined" />
                {master.experience > 0 && <Chip size="small" icon={<WorkHistoryOutlinedIcon />} label={`${master.experience} il təcrübə`} variant="outlined" />}
                {master.completedOrders > 0 && <Chip size="small" icon={<TaskAltIcon />} label={`${master.completedOrders} tamamlanmış iş`} variant="outlined" />}
                <Chip size="small" icon={<PhotoLibraryOutlinedIcon />} label={`${posts?.length ?? 0} paylaşım`} variant="outlined" />
                {!isOwner && <Chip size="small" label={online ? "Onlayn" : "Oflayn"} color={online ? "success" : "default"} variant={online ? "filled" : "outlined"} />}
                {!isOwner && !available && <Chip size="small" color="warning" label="Hazırda sifariş qəbul etmir" />}
                {!isOwner && available && master.isBusy && <Chip size="small" color="warning" label="Hazırda başqa işdədir" />}
              </Stack>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {isOwner ? (
                <>
                  <FormControlLabel
                    control={<Switch checked={available} onChange={(e) => toggleAvailable(e.target.checked)} color="success" />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{available ? "Sifariş qəbul edirəm" : "Sifariş qəbul etmirəm"}</Typography>
                        <Typography variant="caption" color="text.secondary">{available ? "Xəritədə görünürsünüz" : "Xəritədə gizlisiniz"}</Typography>
                      </Box>
                    }
                    sx={{ mr: 1, px: 1.5, py: 0.5, border: 1, borderColor: available ? "success.light" : "divider", borderRadius: 3, bgcolor: available ? "surface.tint" : "transparent" }}
                  />
                  <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onEdit}>Profili redaktə et</Button>
                  <Button variant="contained" startIcon={<AddPhotoAlternateOutlinedIcon />} onClick={onAddPost}>Paylaşım et</Button>
                </>
              ) : master.isDemo ? (
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>Bu profil nümunədir: sifariş, mesaj və zəng qəbul etmir.</Typography>
              ) : (
                <>
                  <Box sx={{ "& > span, & button": { width: "100%" } }}>
                    <CallButton peerId={master._id} peerName={fullName} online={online} />
                  </Box>
                  <Button variant="outlined" startIcon={<ChatBubbleOutlineIcon />} component={RouterLink} to={`/mesajlar?usta=${master._id}`}>
                    Mesaj yaz
                  </Button>
                  {role !== "master" && (
                    <Button variant="contained" startIcon={<AssignmentOutlinedIcon />} onClick={openOrder} disabled={!canOrder}>
                      Sifariş ver
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          {/* Sol: haqqında + yer */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Haqqında</Typography>
                {master.bio ? (
                  <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{master.bio}</Typography>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    {isOwner ? "Özünüz haqqında qısa məlumat əlavə edin — müştərilər buna baxır." : "Usta hələ məlumat əlavə etməyib."}
                  </Typography>
                )}
                <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                  <InfoRow icon={<PlaceOutlinedIcon fontSize="small" />}>{master.city}</InfoRow>
                  {isOwner && master.phone && (
                    <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />}>
                      +{master.phone}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LockOutlinedIcon sx={{ fontSize: 12 }} /> yalnız siz görürsünüz — müştərilər saytdan zəng edir
                      </Typography>
                    </InfoRow>
                  )}
                  <InfoRow icon={<WorkHistoryOutlinedIcon fontSize="small" />}>
                    {formatMonthYear(master.createdAt)} ayından platformada
                  </InfoRow>
                </Stack>
              </Card>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Reytinq və rəylər</Typography>
                <ReviewsSection masterId={master._id} />
              </Card>
              {position && (
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ px: 1, pb: 1.5 }}>İş yeri</Typography>
                  <Box sx={{ height: 220 }}>
                    <MastersMap masters={[master]} />
                  </Box>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Sağ: paylaşımlar */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 2 }}>Görülmüş işlər</Typography>
            {posts === null ? (
              <Grid container spacing={2}>
                {[0, 1].map((i) => (
                  <Grid item xs={12} sm={6} key={i}><Skeleton variant="rounded" height={320} /></Grid>
                ))}
              </Grid>
            ) : posts.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<PhotoLibraryOutlinedIcon />}
                  title="Hələ paylaşım yoxdur"
                  text={isOwner ? "Gördüyünüz işlərin şəkil və videolarını paylaşın — bu, müştərinin etibarını artırır." : undefined}
                  action={isOwner && <Button variant="contained" onClick={onAddPost}>İlk paylaşımı et</Button>}
                />
              </Card>
            ) : (
              <Grid container spacing={2}>
                {posts.map((post) => (
                  <Grid item xs={12} sm={6} key={post._id}>
                    <PostCard
                      post={post}
                      likes={likes[post._id]}
                      onLike={() => toggleLike(post._id)}
                      onDelete={isOwner ? () => deletePost(post._id) : undefined}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
      {!isOwner && <OrderDialog open={orderOpen} master={master} onClose={() => setOrderOpen(false)} />}
      {!isOwner && user && (
        <Container maxWidth="lg" sx={{ pb: 4, mt: -3 }}>
          <Button size="small" color="inherit" startIcon={<ReportOutlinedIcon />} onClick={() => setComplaintOpen(true)} sx={{ color: "text.secondary" }}>
            Bu usta barədə şikayət et
          </Button>
          <ComplaintDialog open={complaintOpen} onClose={() => setComplaintOpen(false)} masterId={master._id} targetName={fullName} />
        </Container>
      )}
    </Box>
  );
}
