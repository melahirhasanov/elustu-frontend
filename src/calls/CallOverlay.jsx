import { useEffect, useState } from "react";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import UserAvatar from "../components/UserAvatar";

function useTimer(startedAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return null;
  const sec = Math.max(0, Math.floor((now - startedAt) / 1000));
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

const STATE_TEXT = {
  calling: "Zəng edilir...",
  ringing: "Gələn zəng",
  connecting: "Qoşulur...",
};

function RoundButton({ color, onClick, children, label }) {
  return (
    <Stack alignItems="center" spacing={0.75}>
      <IconButton
        onClick={onClick}
        aria-label={label}
        sx={{ width: 60, height: 60, bgcolor: color, color: "#fff", "&:hover": { bgcolor: color, filter: "brightness(.92)" } }}
      >
        {children}
      </IconButton>
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,.8)" }}>{label}</Typography>
    </Stack>
  );
}

// Zəng pəncərəsi: ekranın aşağı-sağında üzən kart, mobil ekranda tam en
export default function CallOverlay({ call, onAccept, onReject, onHangup, onToggleMute }) {
  const timer = useTimer(call.state === "active" ? call.startedAt : null);
  const status = call.state === "ended" ? call.reason : call.state === "active" ? timer : STATE_TEXT[call.state];
  const ringing = call.state === "ringing" || call.state === "calling";

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        zIndex: 1600,
        right: { xs: 12, sm: 24 },
        left: { xs: 12, sm: "auto" },
        bottom: { xs: 12, sm: 24 },
        width: { sm: 340 },
        p: 3,
        borderRadius: 5,
        color: "#fff",
        background: "linear-gradient(160deg, #0F766E 0%, #134E4A 100%)",
        boxShadow: "0 24px 60px rgba(15,23,42,.35)",
      }}
    >
      <Stack alignItems="center" spacing={1.5}>
        <Box
          sx={{
            borderRadius: "50%",
            p: 0.75,
            animation: ringing ? "callPulse 1.6s infinite" : "none",
            "@keyframes callPulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(255,255,255,.45)" },
              "100%": { boxShadow: "0 0 0 22px rgba(255,255,255,0)" },
            },
          }}
        >
          <UserAvatar name={call.peerName || "?"} size={76} sx={{ border: "3px solid rgba(255,255,255,.8)" }} />
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6">{call.peerName || "İstifadəçi"}</Typography>
          <Typography sx={{ opacity: 0.85, minHeight: 24 }}>{status}</Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.7 }}>
          <LockOutlinedIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">Sayt daxilində zəng · nömrə paylaşılmır</Typography>
        </Stack>

        {call.state !== "ended" && (
          <Stack direction="row" spacing={4} sx={{ pt: 1 }}>
            {call.state === "ringing" ? (
              <>
                <RoundButton color="#DC2626" onClick={onReject} label="Rədd et"><CallEndIcon /></RoundButton>
                <RoundButton color="#16A34A" onClick={onAccept} label="Cavab ver"><CallIcon /></RoundButton>
              </>
            ) : (
              <>
                <RoundButton color="rgba(255,255,255,.18)" onClick={onToggleMute} label={call.muted ? "Səsi aç" : "Səssiz"}>
                  {call.muted ? <MicOffIcon /> : <MicIcon />}
                </RoundButton>
                <RoundButton color="#DC2626" onClick={onHangup} label="Bitir"><CallEndIcon /></RoundButton>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
