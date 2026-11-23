import { useEffect, useState } from "react";
import socketService from "../api/socket";
import { getCurrentPosition } from "../components/map/mapUtils";

// Usta tərəfi: sifariş "Yoldadır" olanda brauzerin yerini hər bir neçə saniyədən bir müştəriyə göndərir
export default function useShareLocation(orderId, enabled) {
  const [state, setState] = useState("idle"); // idle | sharing | denied
  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;
    let last = 0;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const now = Date.now();
        if (now - last < 3000) return;
        last = now;
        socketService.emit("order:location", { orderId, lat: p.coords.latitude, lng: p.coords.longitude });
        setState("sharing");
      },
      () => setState("denied"),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    // Bəzi brauzerlərdə watchPosition gec başlayır — ilk yeri dərhal göndər
    getCurrentPosition()
      .then(([lat, lng]) => socketService.emit("order:location", { orderId, lat, lng }))
      .catch(() => {});
    return () => navigator.geolocation.clearWatch(id);
  }, [orderId, enabled]);
  return state;
}
