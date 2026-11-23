import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import socketService from "../api/socket";

// Header nişanı üçün: usta üçün cavab gözləyən, müştəri üçün aktiv sifarişlərin sayı
export default function usePendingOrders() {
  const { token, role } = useSelector((s) => s.auth);
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setCount(0);
      return;
    }
    const load = () =>
      api.get("/api/orders/mine")
        .then(({ data }) =>
          setCount(
            data.filter((o) => (role === "master" ? o.status === "pending" : ["pending", "accepted", "on_the_way", "in_progress"].includes(o.status))).length
          )
        )
        .catch(() => {});
    load();
    socketService.on("order_updated", load);
    return () => socketService.off("order_updated", load);
  }, [token, role, pathname]);

  return count;
}
