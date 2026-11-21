import { useEffect, useState } from "react";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import api from "../../api/client";
import { formatDate } from "../../utils/date";
import { COMPLAINT_REASONS, COMPLAINT_STATUS } from "./complaintLabels";


// İstifadəçinin göndərdiyi şikayətlər və onların statusu (şikayət yoxdursa heç nə göstərmir)
export default function MyComplaints() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/complaints/mine").then(({ data }) => setItems(data)).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Şikayətlərim</Typography>
      <Stack spacing={1.5}>
        {items.map((c) => (
          <Box key={c._id} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography variant="subtitle2">{c.target.name} · {COMPLAINT_REASONS[c.reason]}</Typography>
              <Chip size="small" label={COMPLAINT_STATUS[c.status].label} color={COMPLAINT_STATUS[c.status].color} />
            </Stack>
            <Typography variant="caption" color="text.secondary">{formatDate(c.createdAt)}</Typography>
            {c.adminNote && (
              <Typography variant="body2" sx={{ mt: 0.75, p: 1, bgcolor: "#F1F5F9", borderRadius: 1.5 }}>
                <b>Administratorun cavabı:</b> {c.adminNote}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
