import { Box, Typography } from "@mui/material";

export default function EmptyState({ icon, title, text, action }) {
  return (
    <Box sx={{ textAlign: "center", py: 8, px: 2, color: "text.secondary" }}>
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "primary.main",
            "& svg": { fontSize: 32 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {text && <Typography sx={{ maxWidth: 420, mx: "auto" }}>{text}</Typography>}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
}
