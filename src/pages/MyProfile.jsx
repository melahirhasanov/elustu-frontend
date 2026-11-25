import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Card, CircularProgress, Container, Snackbar, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import api from "../api/client";
import { selectDisplayName, updateUser } from "../store/authSlice";
import MasterProfileView from "../components/profile/MasterProfileView";
import EditProfileDialog from "../components/profile/EditProfileDialog";
import PostDialog from "../components/profile/PostDialog";
import PhotoEditor from "../components/profile/PhotoEditor";
import MyComplaints from "../components/complaints/MyComplaints";

function CustomerProfile() {
  const { user } = useSelector((s) => s.auth);
  const name = useSelector(selectDisplayName);
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{ p: 4, textAlign: "center" }}>
        <PhotoEditor name={name} src={user.profileImage} size={96} sx={{ mx: "auto", mb: 2 }} />
        <Typography variant="h5">{name}</Typography>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ color: "text.secondary", mt: 0.5 }}>
          <MailOutlineIcon fontSize="small" />
          <Typography variant="body2">{user.email}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Müştəri hesabı ilə ustaları axtara və onlara birbaşa yaza bilərsiniz.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
          <Button variant="contained" startIcon={<SearchIcon />} component={RouterLink} to="/ustalar">Usta axtar</Button>
          <Button variant="outlined" startIcon={<ChatBubbleOutlineIcon />} component={RouterLink} to="/mesajlar">Mesajlarım</Button>
        </Stack>
      </Card>
      <MyComplaints />
    </Container>
  );
}

function OwnMasterProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [master, setMaster] = useState(null);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [postsVersion, setPostsVersion] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.get("/api/master/me").then(({ data }) => setMaster(data)).catch(() => setError("Profil yüklənmədi"));
  }, [user.id]);

  if (error) return <Container sx={{ py: 6 }}><Alert severity="error">{error}</Alert></Container>;
  if (!master) return <Box sx={{ display: "grid", placeItems: "center", py: 12 }}><CircularProgress /></Box>;

  return (
    <>
      <MasterProfileView
        master={master}
        isOwner
        onPhotoChange={(profileImage) => setMaster((m) => ({ ...m, profileImage }))}
        onEdit={() => setEditOpen(true)}
        onAddPost={() => setPostOpen(true)}
        postsVersion={postsVersion}
      />
      <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
        <MyComplaints />
      </Container>
      <EditProfileDialog
        open={editOpen}
        master={master}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setMaster(updated);
          const { name, surname, phone, city, category } = updated;
          dispatch(updateUser({ name, surname, phone, city, category }));
          setEditOpen(false);
          setToast("Profil yeniləndi");
        }}
      />
      <PostDialog
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onCreated={() => {
          setPostOpen(false);
          setPostsVersion((v) => v + 1);
          setToast("Paylaşım əlavə edildi");
        }}
      />
      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setToast("")}>{toast}</Alert>
      </Snackbar>
    </>
  );
}

export default function MyProfile() {
  const { role } = useSelector((s) => s.auth);
  return role === "master" ? <OwnMasterProfile /> : <CustomerProfile />;
}
