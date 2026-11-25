import { Avatar } from "@mui/material";

// Adın baş hərflərindən avatar; rəng addan sabit seçilir ki, eyni adam həmişə eyni rəngdə görünsün
const COLORS = ["#0F766E", "#0369A1", "#7C3AED", "#B45309", "#BE185D", "#15803D", "#4338CA", "#9F1239"];

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function colorFor(name = "") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function UserAvatar({ name = "", src, size = 40, sx, ...props }) {
  return (
    <Avatar
      src={src || undefined}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        bgcolor: colorFor(name),
        color: "#fff",
        ...sx,
      }}
      {...props}
    >
      {initials(name)}
    </Avatar>
  );
}
