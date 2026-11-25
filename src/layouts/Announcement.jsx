import { useEffect, useState } from "react";
import { Alert } from "@mui/material";
import api from "../api/client";

// Admin paneldən yazılan elan (Parametrlər bölməsi)
export default function Announcement() {
  const [text, setText] = useState("");
  useEffect(() => {
    api.get("/api/settings").then(({ data }) => setText(data.announcement || "")).catch(() => {});
  }, []);
  if (!text) return null;
  return <Alert severity="info" onClose={() => setText("")} sx={{ borderRadius: 0, py: 0.25, justifyContent: "center", flexShrink: 0 }}>{text}</Alert>;
}
