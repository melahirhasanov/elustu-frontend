import { Box } from "@mui/material";
import { initials } from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatDistance } from "./mapUtils";

// Xəritədəki usta pin-i: baş hərflər, ixtisas ikonu, məsafə yazısı; seçiləndə böyüyür və narıncı olur
export default function MasterPin({ master, selected, online, distance }) {
  const dist = distance != null && isFinite(distance) ? formatDistance(distance) : null;
  const size = selected ? 52 : 42;
  return (
    <Box
      sx={{
        position: "relative",
        cursor: "pointer",
        transform: selected ? "translateY(-4px)" : "none",
        transition: "transform .15s",
        filter: "drop-shadow(0 4px 8px rgba(15,23,42,.3))",
        "&:hover": { transform: "translateY(-3px)" },
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: selected ? "secondary.main" : "primary.main",
          color: selected ? "#1F2937" : "primary.contrastText",
          border: "3px solid #fff",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: size * 0.34,
          transition: "all .15s",
        }}
      >
        {master.profileImage ? (
          <Box component="img" src={master.profileImage} alt="" sx={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          initials(`${master.name} ${master.surname}`)
        )}
      </Box>
      {/* Aşağı ox */}
      <Box sx={{ width: 0, height: 0, mx: "auto", mt: "-2px", borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "9px solid #fff" }} />
      {/* İxtisas nişanı */}
      <Box
        sx={{
          position: "absolute", right: -4, bottom: 8, width: 20, height: 20, borderRadius: "50%",
          bgcolor: "background.paper", color: "primary.main", display: "grid", placeItems: "center",
          "& svg": { fontSize: 13 },
        }}
      >
        <CategoryIcon category={master.category} />
      </Box>
      {dist && (
        <Box
          sx={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", mt: 0.25,
            px: 0.75, py: 0.1, borderRadius: 99, whiteSpace: "nowrap",
            bgcolor: selected ? "secondary.main" : "background.paper", color: selected ? "#1F2937" : "text.primary",
            fontSize: 11, fontWeight: 700, boxShadow: "0 1px 3px rgba(15,23,42,.25)",
          }}
        >
          {dist}
        </Box>
      )}
      {online && (
        <Box sx={{ position: "absolute", left: 0, top: 0, width: 12, height: 12, borderRadius: "50%", bgcolor: "success.main", border: "2px solid #fff" }} />
      )}
    </Box>
  );
}
