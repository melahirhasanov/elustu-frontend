import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import socketService from "../api/socket";
import { startRingback, startRingtone } from "./tones";
import CallOverlay from "./CallOverlay";

const CallContext = createContext({ startCall: () => {}, call: null });
// eslint-disable-next-line react-refresh/only-export-components
export const useCall = () => useContext(CallContext);

const ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
const RING_TIMEOUT_MS = 35000;

// Brauzer daxilində səsli zəng (WebRTC). Siqnallar socket ilə, səs birbaşa brauzerlər arasında.
// Telefon nömrəsi heç bir mərhələdə istifadə olunmur.
export default function CallProvider({ children }) {
  const token = useSelector((s) => s.auth.token);
  const [call, setCall] = useState(null);
  // call: { id, peerId, peerName, direction, state: calling|ringing|connecting|active|ended, startedAt, reason, muted }

  const callRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingIceRef = useRef([]);
  const offerRef = useRef(null);
  const stopToneRef = useRef(null);
  const timeoutRef = useRef(null);

  const update = useCallback((patch) => {
    callRef.current = patch === null ? null : { ...(callRef.current || {}), ...patch };
    setCall(callRef.current);
  }, []);

  const stopTone = () => {
    stopToneRef.current?.();
    stopToneRef.current = null;
  };

  const cleanup = useCallback(() => {
    stopTone();
    clearTimeout(timeoutRef.current);
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pendingIceRef.current = [];
    offerRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  }, []);

  // Zəngi bitir və səbəbi qısa müddət göstər
  const finish = useCallback(
    (reason) => {
      cleanup();
      if (!callRef.current) return;
      update({ state: "ended", reason });
      const endedId = callRef.current.id;
      setTimeout(() => {
        if (callRef.current?.id === endedId && callRef.current.state === "ended") update(null);
      }, 2500);
    },
    [cleanup, update]
  );

  const createPeer = useCallback(
    (peerId, callId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc.onicecandidate = (e) => {
        if (e.candidate) socketService.emit("call:ice", { to: peerId, candidate: e.candidate, callId });
      };
      pc.ontrack = (e) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = e.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") update({ state: "active", startedAt: callRef.current?.startedAt || Date.now() });
        if (pc.connectionState === "failed") {
          socketService.emit("call:end", { to: peerId, callId });
          finish("Bağlantı qurulmadı");
        }
      };
      pcRef.current = pc;
      return pc;
    },
    [finish, update]
  );

  const getMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    localStreamRef.current = stream;
    return stream;
  };

  const flushIce = async () => {
    const pc = pcRef.current;
    for (const c of pendingIceRef.current) await pc?.addIceCandidate(c).catch(() => {});
    pendingIceRef.current = [];
  };

  // Zəng et: peerId — qarşı tərəfin chat ID-si (usta üçün ID, müştəri üçün email)
  const startCall = useCallback(
    async (peerId, peerName) => {
      if (callRef.current || !peerId) return;
      if (!socketService.isConnected()) {
        update({ id: "offline", peerId, peerName, direction: "outgoing", state: "ended", reason: "Serverlə bağlantı yoxdur" });
        setTimeout(() => update(null), 2500);
        return;
      }
      const callId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      update({ id: callId, peerId, peerName, direction: "outgoing", state: "calling", muted: false });
      try {
        const stream = await getMic();
        const pc = createPeer(peerId, callId);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.emit("call:offer", { to: peerId, sdp: offer, callId });
        stopToneRef.current = startRingback();
        timeoutRef.current = setTimeout(() => {
          if (callRef.current?.id === callId && callRef.current.state === "calling") {
            socketService.emit("call:end", { to: peerId, callId });
            finish("Cavab verilmədi");
          }
        }, RING_TIMEOUT_MS);
      } catch {
        finish("Mikrofona icazə verilmədi");
      }
    },
    [createPeer, finish, update]
  );

  const accept = useCallback(async () => {
    const c = callRef.current;
    if (!c || c.state !== "ringing") return;
    stopTone();
    update({ state: "connecting" });
    try {
      const stream = await getMic();
      const pc = createPeer(c.peerId, c.id);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription(offerRef.current);
      await flushIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.emit("call:answer", { to: c.peerId, sdp: answer, callId: c.id });
    } catch {
      socketService.emit("call:end", { to: c.peerId, callId: c.id });
      finish("Mikrofona icazə verilmədi");
    }
  }, [createPeer, finish, update]);

  const reject = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    socketService.emit("call:reject", { to: c.peerId, callId: c.id });
    cleanup();
    update(null);
  }, [cleanup, update]);

  const hangup = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    if (c.state !== "ended") socketService.emit("call:end", { to: c.peerId, callId: c.id });
    finish("Zəng bitdi");
  }, [finish]);

  const toggleMute = useCallback(() => {
    const muted = !callRef.current?.muted;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !muted));
    update({ muted });
  }, [update]);

  // Socket siqnalları
  useEffect(() => {
    if (!token) return;
    const isCurrent = (callId) => callRef.current?.id === callId;

    const onIncoming = ({ from, fromName, sdp, callId }) => {
      if (callRef.current) {
        socketService.emit("call:reject", { to: from, callId }); // məşğuldur
        return;
      }
      offerRef.current = sdp;
      update({ id: callId, peerId: from, peerName: fromName, direction: "incoming", state: "ringing", muted: false });
      stopToneRef.current = startRingtone();
      timeoutRef.current = setTimeout(() => {
        if (isCurrent(callId) && callRef.current.state === "ringing") finish("Buraxılmış zəng");
      }, RING_TIMEOUT_MS);
    };
    const onAnswered = async ({ sdp, callId }) => {
      if (!isCurrent(callId) || !pcRef.current) return;
      stopTone();
      clearTimeout(timeoutRef.current);
      update({ state: "connecting" });
      await pcRef.current.setRemoteDescription(sdp).catch(() => finish("Bağlantı qurulmadı"));
      await flushIce();
    };
    const onIce = ({ candidate, callId }) => {
      if (!isCurrent(callId)) return;
      if (pcRef.current?.remoteDescription) pcRef.current.addIceCandidate(candidate).catch(() => {});
      else pendingIceRef.current.push(candidate);
    };
    const onRejected = ({ callId }) => isCurrent(callId) && finish("Zəng rədd edildi və ya istifadəçi məşğuldur");
    const onEnded = ({ callId }) => isCurrent(callId) && finish(callRef.current.state === "ringing" ? "Buraxılmış zəng" : "Zəng bitdi");
    const onUnavailable = ({ callId }) => isCurrent(callId) && finish("İstifadəçi hazırda onlayn deyil. Mesaj yazın.");
    const onTaken = ({ callId }) => {
      if (isCurrent(callId)) {
        cleanup();
        update(null);
      }
    };

    const events = {
      "call:incoming": onIncoming,
      "call:answered": onAnswered,
      "call:ice": onIce,
      "call:rejected": onRejected,
      "call:ended": onEnded,
      "call:unavailable": onUnavailable,
      "call:taken": onTaken,
    };
    Object.entries(events).forEach(([e, h]) => socketService.on(e, h));
    return () => Object.entries(events).forEach(([e, h]) => socketService.off(e, h));
  }, [token, cleanup, finish, update]);

  // Çıxış edəndə aktiv zəngi bağla
  useEffect(() => {
    if (!token && callRef.current) {
      cleanup();
      update(null);
    }
  }, [token, cleanup, update]);

  const value = useMemo(() => ({ startCall, call }), [startCall, call]);

  return (
    <CallContext.Provider value={value}>
      {children}
      <audio ref={remoteAudioRef} autoPlay />
      {call && <CallOverlay call={call} onAccept={accept} onReject={reject} onHangup={hangup} onToggleMute={toggleMute} />}
    </CallContext.Provider>
  );
}
