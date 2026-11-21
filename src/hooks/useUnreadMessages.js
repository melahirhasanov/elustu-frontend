import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import socketService from "../api/socket";
import { selectChatId } from "../store/authSlice";

// Daxil olmuş istifadəçini bütün saytda socket-ə qoşur (onlayn status, zəng, bildirişlər)
// və mesajlar səhifəsindən kənarda oxunmamış mesajların sayını qaytarır.
export default function useUnreadMessages() {
  const token = useSelector((s) => s.auth.token);
  const myId = useSelector(selectChatId);
  const { pathname } = useLocation();
  const onMessagesPage = pathname.startsWith("/mesajlar");
  const onMessagesPageRef = useRef(onMessagesPage);
  onMessagesPageRef.current = onMessagesPage;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      setUnread(0);
      return;
    }
    socketService.connect(token);
    const onMessage = (msg) => {
      if (msg?.senderId !== myId && !onMessagesPageRef.current) setUnread((n) => n + 1);
    };
    socketService.on("receive_message", onMessage);
    return () => socketService.off("receive_message", onMessage);
  }, [token, myId]);

  // Mesajlar səhifəsindən çıxanda real sayı serverdən yenilə
  useEffect(() => {
    if (!token) return;
    if (onMessagesPage) {
      setUnread(0);
      return;
    }
    api
      .get("/api/messages/conversations")
      .then(({ data }) => setUnread((data.data || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0)))
      .catch(() => {});
  }, [token, onMessagesPage]);

  return unread;
}
