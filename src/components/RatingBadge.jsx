import { Rating, Stack, Typography } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

// Ustanın reytinqi; rəy yoxdursa "Yeni usta"
export default function RatingBadge({ master, size = "small", showCount = true }) {
  if (!master?.ratingCount) {
    return (
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
        Yeni usta
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <StarRoundedIcon sx={{ color: "secondary.main", fontSize: size === "small" ? 18 : 22 }} />
      <Typography variant={size === "small" ? "body2" : "subtitle1"} sx={{ fontWeight: 700 }}>
        {master.ratingAvg.toFixed(1)}
      </Typography>
      {showCount && (
        <Typography variant="body2" color="text.secondary">
          ({master.ratingCount} rəy)
        </Typography>
      )}
    </Stack>
  );
}

export function Stars({ value, size = "small" }) {
  return <Rating value={value} readOnly size={size} precision={0.5} icon={<StarRoundedIcon fontSize="inherit" />} emptyIcon={<StarRoundedIcon fontSize="inherit" />} sx={{ color: "secondary.main" }} />;
}
