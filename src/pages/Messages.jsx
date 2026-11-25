import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Badge, Box, Button, CircularProgress, IconButton, InputAdornment, List, ListItemButton,
  Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import api from "../api/client";
import socketService from "../api/socket";
import { selectChatId, selectDisplayName } from "../store/authSlice";
import UserAvatar from "../components/UserAvatar";
import EmptyState from "../components/EmptyState";
import CallButton from "../calls/CallButton";
import useOnlineIds from "../hooks/useOnlineIds";
import { formatClock, formatDate, formatShortDate } from "../utils/date";


const msgTime = (m) => m.createdAt || m.timestamp;
function formatListTime(d) {
  if (!d) return "";
  const date = new Date(d);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay ? formatClock(date) : formatShortDate(date);
}
function formatDay(d) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (date.toDateString() === today.toDateString()) return "Bu gün";
  if (date.toDateString() === yesterday.toDateString()) return "Dünən";
  return formatDate(date);
}

export default function Messages() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [params, setParams] = useSearchParams();
  const preselectMasterId = params.get("usta");
  const preselectRoom = params.get("otaq");

  const { role, user, token } = useSelector((s) => s.auth);
  const myId = useSelector(selectChatId);
  const myName = useSelector(selectDisplayName);

  const [conversations, setConversations] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const onlineIds = useOnlineIds();

  const activeRoomRef = useRef(null);
  const conversationsRef = useRef(null);
  const typingSentRef = useRef(false);
  const typingStopTimer = useRef(null);
  const partnerTypingTimer = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  conversationsRef.current = conversations;

  const active = useMemo(
    () => conversations?.find((c) => c.roomId === activeRoom) || null,
    [conversations, activeRoom]
  );

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/api/messages/conversations");
      setConversations((prev) => {
        const fetched = data.data || [];
        // Hələ mesajı olmayan (yeni açılmış) söhbəti itirməmək üçün saxla
        const drafts = (prev || []).filter((c) => c.isDraft && !fetched.some((f) => f.roomId === c.roomId));
        return [...drafts, ...fetched];
      });
    } catch {
      setConversations((prev) => prev || []);
    }
  }, [token]); // istifadəçi dəyişəndə yenidən yüklə

  // Socket bağlantısı və hadisələr
  useEffect(() => {
    if (!myId) return;
    socketService.connect(token);

    const onConnect = () => {
      if (activeRoomRef.current) socketService.joinRoom(activeRoomRef.current);
    };

    const onMessage = (msg) => {
      if (!msg?.roomId) return;
      const isMine = msg.senderId === myId;
      const isActive = msg.roomId === activeRoomRef.current;

      if (isActive) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          const i = msg.tempId ? prev.findIndex((m) => m._id === msg.tempId) : -1;
          if (i !== -1) {
            const next = [...prev];
            next[i] = msg;
            return next;
          }
          return [...prev, msg];
        });
        if (!isMine) {
          setPartnerTyping(false);
          api.put(`/api/messages/room/${encodeURIComponent(msg.roomId)}/read-all`).catch(() => {});
        }
      }

      // Yeni söhbətdən gələn ilk mesaj: siyahını serverdən yenilə
      if (!conversationsRef.current?.some((c) => c.roomId === msg.roomId)) {
        loadConversations();
        return;
      }
      setConversations((prev) => {
        const list = prev || [];
        const existing = list.find((c) => c.roomId === msg.roomId);
        if (!existing) return list;
        const updated = {
          ...existing,
          isDraft: false,
          lastMessage: msg.message,
          lastMessageTime: msgTime(msg),
          lastSenderId: msg.senderId,
          unreadCount: !isMine && !isActive ? (existing.unreadCount || 0) + 1 : existing.unreadCount,
        };
        return [updated, ...list.filter((c) => c.roomId !== msg.roomId)];
      });
    };

    const onError = (data) => {
      if (data?.tempId) setMessages((prev) => prev.filter((m) => m._id !== data.tempId));
    };

    const onTyping = (data) => {
      if (data.roomId !== activeRoomRef.current || data.userId === myId) return;
      setPartnerTyping(data.isTyping);
      clearTimeout(partnerTypingTimer.current);
      if (data.isTyping) partnerTypingTimer.current = setTimeout(() => setPartnerTyping(false), 4000);
    };

    // Qarşı tərəf oxuyanda mənim mesajlarım "✓✓" olur
    const onRead = ({ roomId }) => {
      if (roomId === activeRoomRef.current) {
        setMessages((prev) => prev.map((m) => (m.senderId === myId && !m.isRead ? { ...m, isRead: true } : m)));
      }
    };

    socketService.on("connect", onConnect);
    socketService.on("receive_message", onMessage);
    socketService.on("message_error", onError);
    socketService.on("typing_indicator", onTyping);
    socketService.on("messages_read", onRead);

    return () => {
      socketService.off("connect", onConnect);
      socketService.off("receive_message", onMessage);
      socketService.off("message_error", onError);
      socketService.off("typing_indicator", onTyping);
      socketService.off("messages_read", onRead);
      if (activeRoomRef.current) socketService.leaveRoom(activeRoomRef.current);
    };
  }, [myId, token, loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ?usta=<id> ilə gəlinibsə (müştəri): həmin usta ilə söhbəti aç, yoxdursa qaralama yarat
  useEffect(() => {
    if (!preselectMasterId || role !== "customer" || conversations === null) return;
    const roomId = `${user.email}_${preselectMasterId}`;
    if (conversations.some((c) => c.roomId === roomId)) {
      setActiveRoom(roomId);
      setParams({}, { replace: true });
      return;
    }
    api.get(`/api/master/${preselectMasterId}`).then(({ data }) => {
      // StrictMode effekti iki dəfə işlədə bilər — eyni qaralamanı ikinci dəfə əlavə etmə
      setConversations((prev) =>
        (prev || []).some((c) => c.roomId === roomId)
          ? prev
          : [
              { roomId, isDraft: true, user: { _id: data._id, name: `${data.name} ${data.surname}`, category: data.category, profileImage: data.profileImage }, lastMessage: "", unreadCount: 0 },
              ...(prev || []),
            ]
      );
      setActiveRoom(roomId);
      setParams({}, { replace: true });
    }).catch(() => setParams({}, { replace: true }));
  }, [preselectMasterId, role, user?.email, conversations, setParams]);

  // ?otaq=<roomId> (usta sifariş kartından gəlir): mövcud söhbəti aç, yoxdursa qaralama yarat
  useEffect(() => {
    if (!preselectRoom || conversations === null) return;
    if (!conversations.some((c) => c.roomId === preselectRoom)) {
      const customerEmail = preselectRoom.slice(0, preselectRoom.lastIndexOf("_"));
      setConversations((prev) =>
        (prev || []).some((c) => c.roomId === preselectRoom)
          ? prev
          : [{ roomId: preselectRoom, isDraft: true, user: { _id: customerEmail, name: customerEmail.split("@")[0] }, lastMessage: "", unreadCount: 0 }, ...(prev || [])]
      );
    }
    setActiveRoom(preselectRoom);
    setParams({}, { replace: true });
  }, [preselectRoom, conversations, setParams]);

  // Aktiv söhbət dəyişəndə: otağa qoşul, mesajları yüklə, oxundu et
  useEffect(() => {
    const prevRoom = activeRoomRef.current;
    if (prevRoom && prevRoom !== activeRoom) socketService.leaveRoom(prevRoom);
    activeRoomRef.current = activeRoom;
    setPartnerTyping(false);
    setMessages([]);
    if (!activeRoom) return;

    socketService.joinRoom(activeRoom);
    let cancelled = false;
    setLoadingMessages(true);
    api.get(`/api/messages/room/${encodeURIComponent(activeRoom)}`)
      .then(({ data }) => !cancelled && setMessages(data.data || []))
      .catch(() => {})
      .finally(() => !cancelled && setLoadingMessages(false));

    api.put(`/api/messages/room/${encodeURIComponent(activeRoom)}/read-all`).catch(() => {});
    setConversations((prev) => prev?.map((c) => (c.roomId === activeRoom ? { ...c, unreadCount: 0 } : c)) || prev);
    if (!isMobile) setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, partnerTyping]);

  const sendTyping = (typing) => {
    if (!activeRoomRef.current || typingSentRef.current === typing) return;
    typingSentRef.current = typing;
    socketService.sendTyping(activeRoomRef.current, typing);
  };

  const handleDraft = (e) => {
    setDraft(e.target.value);
    sendTyping(Boolean(e.target.value));
    clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => sendTyping(false), 1500);
  };

  const send = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const message = {
      _id: tempId,
      tempId,
      roomId: active.roomId,
      senderId: myId,
      senderName: myName,
      senderType: role === "master" ? "master" : "user",
      receiverId: String(active.user._id),
      receiverName: active.user.name || "İstifadəçi",
      message: text,
      createdAt: new Date().toISOString(),
      isRead: false,
      pending: true,
    };
    setMessages((prev) => [...prev, message]);
    setDraft("");
    sendTyping(false);

    if (socketService.sendMessage(message)) return;
    // Socket yoxdursa REST ilə göndər
    try {
      const { data } = await api.post("/api/messages", message);
      if (data.data) setMessages((prev) => prev.map((m) => (m._id === tempId ? data.data : m)));
      loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations || [];
    return (conversations || []).filter((c) => (c.user?.name || "").toLowerCase().includes(term));
  }, [conversations, search]);

  const partnerOnline = active && onlineIds.has(String(active.user._id));
  const showList = !isMobile || !activeRoom;
  const showChat = !isMobile || Boolean(activeRoom);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", bgcolor: "background.paper" }}>
      {/* SÖHBƏT SİYAHISI */}
      {showList && (
        <Box sx={{ width: { xs: "100%", md: 340 }, flexShrink: 0, borderRight: { md: 1 }, borderColor: "divider", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Mesajlar</Typography>
            <TextField
              size="small"
              placeholder="Söhbət axtar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            />
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {conversations === null ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 6 }}><CircularProgress size={28} /></Box>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<ChatBubbleOutlineIcon />}
                title={search ? "Tapılmadı" : "Hələ söhbət yoxdur"}
                text={search ? undefined : role === "master" ? "Müştərilər sizə yazanda burada görünəcək." : "Ustanın profilində \"Mesaj yaz\" düyməsinə basın."}
                action={!search && role !== "master" && <Button variant="contained" component={RouterLink} to="/ustalar">Usta tap</Button>}
              />
            ) : (
              <List disablePadding>
                {filtered.map((c) => {
                  const selected = c.roomId === activeRoom;
                  const online = onlineIds.has(String(c.user?._id));
                  const mineLast = c.lastSenderId === myId;
                  return (
                    <ListItemButton
                      key={c.roomId}
                      selected={selected}
                      onClick={() => setActiveRoom(c.roomId)}
                      sx={{ px: 2, py: 1.5, gap: 1.5, borderBottom: 1, borderColor: "divider", "&.Mui-selected": { bgcolor: "rgba(15,118,110,.08)" } }}
                    >
                      <Badge overlap="circular" variant="dot" invisible={!online} color="success" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                        <UserAvatar name={c.user?.name} src={c.user?.profileImage} size={46} />
                      </Badge>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                          <Typography variant="subtitle2" noWrap>{c.user?.name || "İstifadəçi"}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{formatListTime(c.lastMessageTime)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Typography variant="body2" color={c.unreadCount ? "text.primary" : "text.secondary"} noWrap sx={{ fontWeight: c.unreadCount ? 600 : 400 }}>
                            {c.isDraft ? "Yeni söhbət" : `${mineLast ? "Siz: " : ""}${c.lastMessage}`}
                          </Typography>
                          {c.unreadCount > 0 && (
                            <Box sx={{ minWidth: 20, height: 20, px: 0.75, borderRadius: 99, bgcolor: "primary.main", color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 }}>
                              {c.unreadCount}
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>
      )}

      {/* AKTİV SÖHBƏT */}
      {showChat && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, bgcolor: "background.default" }}>
          {!active ? (
            <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
              <EmptyState icon={<ChatBubbleOutlineIcon />} title="Söhbət seçin" text="Soldakı siyahıdan söhbət seçərək yazışmaya başlayın." />
            </Box>
          ) : (
            <>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.25, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
                {isMobile && (
                  <IconButton onClick={() => setActiveRoom(null)} aria-label="Geri"><ArrowBackIcon /></IconButton>
                )}
                <UserAvatar name={active.user?.name} src={active.user?.profileImage} size={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>{active.user?.name}</Typography>
                  <Typography variant="caption" color={partnerTyping ? "primary.main" : partnerOnline ? "success.main" : "text.secondary"}>
                    {partnerTyping ? "yazır..." : partnerOnline ? "onlayn" : "oflayn"}
                  </Typography>
                </Box>
                <CallButton iconOnly peerId={active.user._id} peerName={active.user.name} online={partnerOnline} />
                {role === "customer" && (
                  <Button size="small" variant="outlined" component={RouterLink} to={`/usta/${active.user._id}`}>Profil</Button>
                )}
              </Stack>

              <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 1.5, md: 3 }, py: 2 }}>
                {loadingMessages ? (
                  <Box sx={{ display: "grid", placeItems: "center", py: 6 }}><CircularProgress size={28} /></Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: "center", color: "text.secondary", py: 6 }}>
                    <Typography variant="subtitle1" color="text.primary">{active.user?.name} ilə söhbətə başlayın</Typography>
                    <Typography variant="body2">İşi qısa təsvir edin: nə lazımdır, harada və nə vaxt.</Typography>
                  </Box>
                ) : (
                  messages.map((m, i) => {
                    const mine = m.senderId === myId;
                    const showDay = i === 0 || new Date(msgTime(m)).toDateString() !== new Date(msgTime(messages[i - 1])).toDateString();
                    return (
                      <Fragment key={m._id}>
                        {showDay && (
                          <Box sx={{ textAlign: "center", my: 2 }}>
                            <Typography variant="caption" sx={{ bgcolor: "#E2E8F0", color: "text.secondary", px: 1.5, py: 0.5, borderRadius: 99 }}>
                              {formatDay(msgTime(m))}
                            </Typography>
                          </Box>
                        )}
                        <Stack direction="row" justifyContent={mine ? "flex-end" : "flex-start"} sx={{ mb: 0.75 }}>
                          <Box
                            sx={{
                              maxWidth: { xs: "82%", md: "65%" },
                              px: 1.75,
                              py: 1,
                              borderRadius: 3,
                              borderBottomRightRadius: mine ? 6 : 24,
                              borderBottomLeftRadius: mine ? 24 : 6,
                              bgcolor: mine ? "primary.main" : "background.paper",
                              color: mine ? "#fff" : "text.primary",
                              border: mine ? "none" : 1,
                              borderColor: "divider",
                              opacity: m.pending ? 0.7 : 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.message}</Typography>
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.25, opacity: 0.75 }}>
                              <Typography variant="caption" sx={{ fontSize: 11 }}>{formatClock(msgTime(m))}</Typography>
                              {mine && (m.isRead ? <DoneAllIcon sx={{ fontSize: 14 }} /> : <DoneIcon sx={{ fontSize: 14 }} />)}
                            </Stack>
                          </Box>
                        </Stack>
                      </Fragment>
                    );
                  })
                )}
                {partnerTyping && (
                  <Box sx={{ display: "inline-flex", gap: 0.5, px: 1.5, py: 1.25, borderRadius: 3, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                    {[0, 1, 2].map((d) => (
                      <Box key={d} sx={{
                        width: 7, height: 7, borderRadius: "50%", bgcolor: "text.secondary",
                        animation: "typingDot 1.2s infinite", animationDelay: `${d * 0.15}s`,
                        "@keyframes typingDot": { "0%,60%,100%": { opacity: 0.3, transform: "translateY(0)" }, "30%": { opacity: 1, transform: "translateY(-3px)" } },
                      }} />
                    ))}
                  </Box>
                )}
                <div ref={endRef} />
              </Box>

              <Box component="form" onSubmit={send} sx={{ p: 1.5, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    inputRef={inputRef}
                    placeholder="Mesaj yazın..."
                    value={draft}
                    onChange={handleDraft}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    multiline
                    maxRows={4}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "background.default" } }}
                  />
                  <IconButton type="submit" color="primary" disabled={!draft.trim()} aria-label="Göndər"
                    sx={{ bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" }, width: 42, height: 42 }}>
                    <SendRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
