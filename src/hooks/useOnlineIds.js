import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/client";
import socketService from "../api/socket";

// Onlayn istifadəçilərin chat ID-ləri (Set). Daxil olubsa socket ilə canlı yenilənir.
export default function useOnlineIds() {
  const token = useSelector((s) => s.auth.token);
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    api.get("/api/online-users")
      .then(({ data }) => !cancelled && setIds(new Set((data.ids || []).map(String))))
      .catch(() => {});

    const onStatus = (data) =>
      setIds((prev) => {
        const next = new Set(prev);
        if (data.isOnline) next.add(String(data.userId));
        else next.delete(String(data.userId));
        return next;
      });
    socketService.on("user_status", onStatus);
    return () => {
      cancelled = true;
      socketService.off("user_status", onStatus);
    };
  }, [token]);

  return ids;
}
