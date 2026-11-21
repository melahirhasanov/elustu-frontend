import { Box, Button, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import UserAvatar from "./UserAvatar";
import CategoryIcon from "./CategoryIcon";
import { formatDistance } from "./map/mapUtils";
import RatingBadge from "./RatingBadge";

export default function MasterCard({ master, distance, selected, onHover }) {
  const fullName = `${master.name} ${master.surname}`;
  const dist = formatDistance(distance);

  return (
    <Card
      onMouseEnter={() => onHover?.(master._id)}
      sx={{
        transition: "border-color .15s, box-shadow .15s",
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected ? "0 0 0 3px rgba(15,118,110,.12)" : "none",
        "&:hover": { borderColor: "primary.light" },
      }}
    >
      <CardActionArea component={RouterLink} to={`/usta/${master._id}`} sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <UserAvatar name={fullName} size={52} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" noWrap>
              {fullName}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "primary.main" }}>
              <CategoryIcon category={master.category} sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {master.category}
              </Typography>
            </Stack>
            <RatingBadge master={master} />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Chip size="small" icon={<PlaceOutlinedIcon />} label={master.city} variant="outlined" />
          {dist && <Chip size="small" icon={<NearMeOutlinedIcon />} label={dist} color="primary" variant="outlined" />}
          {master.experience > 0 && <Chip size="small" label={`${master.experience} il təcrübə`} variant="outlined" />}
        </Stack>

        {master.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {master.bio}
          </Typography>
        )}
      </CardActionArea>
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          component={RouterLink}
          to={`/mesajlar?usta=${master._id}`}
          variant="contained"
          fullWidth
          startIcon={<ChatBubbleOutlineIcon />}
        >
          Mesaj yaz
        </Button>
      </Box>
    </Card>
  );
}
