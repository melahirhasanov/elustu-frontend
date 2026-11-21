import { Box, Card, CardContent, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { API_URL } from "../../api/client";
import { formatDate } from "../../utils/date";

const mediaUrl = (url = "") => (url.startsWith("http") ? url : `${API_URL}/${url.replace(/^\/+/, "")}`);

export default function PostCard({ post, likes, onLike, onDelete }) {
  const isVideo = post.mediaType === "video";
  const date = formatDate(post.createdAt);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ aspectRatio: "4 / 3", bgcolor: "#0F172A", position: "relative" }}>
        {isVideo ? (
          <video src={mediaUrl(post.media)} controls preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Box component="img" src={mediaUrl(post.media)} alt={post.title} loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </Box>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" gutterBottom>{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, whiteSpace: "pre-line" }}>
          {post.description}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
          <Stack direction="row" alignItems="center">
            <IconButton size="small" onClick={onLike} aria-label="Bəyən" color={likes?.liked ? "error" : "default"}>
              {likes?.liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">{likes?.count || 0}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" color="text.secondary">{date}</Typography>
            {onDelete && (
              <Tooltip title="Postu sil">
                <IconButton size="small" onClick={onDelete} aria-label="Postu sil">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
