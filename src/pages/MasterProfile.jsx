import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { Box, Button, CircularProgress } from "@mui/material";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import api from "../api/client";
import MasterProfileView from "../components/profile/MasterProfileView";
import EmptyState from "../components/EmptyState";

export default function MasterProfile() {
  const { id } = useParams();
  const { user, role } = useSelector((s) => s.auth);
  const [master, setMaster] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMaster(null);
    setNotFound(false);
    api.get(`/api/master/${id}`).then(({ data }) => setMaster(data)).catch(() => setNotFound(true));
  }, [id]);

  // Usta öz ictimai səhifəsini açırsa, redaktə imkanı olan "Profilim"ə keçir
  if (role === "master" && user?.id === id) return <Navigate to="/profil" replace />;

  if (notFound) {
    return (
      <EmptyState
        icon={<PersonSearchOutlinedIcon />}
        title="Usta tapılmadı"
        text="Bu profil silinib və ya link səhvdir."
        action={<Button variant="contained" component={RouterLink} to="/ustalar">Ustalara bax</Button>}
      />
    );
  }

  if (!master) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <MasterProfileView master={master} isOwner={false} />;
}
