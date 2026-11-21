// Səs faylı olmadan zəng səsləri (WebAudio)
let ctx = null;
const audioCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

function beep(freqs, duration) {
  try {
    const ac = audioCtx();
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.02);
    gain.gain.setValueAtTime(0.12, ac.currentTime + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    gain.connect(ac.destination);
    for (const f of freqs) {
      const osc = ac.createOscillator();
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start();
      osc.stop(ac.currentTime + duration);
    }
  } catch {
    /* səs dəstəklənmir — səssiz davam et */
  }
}

// "Zəng gedir" səsi (zəng edən eşidir) və "gələn zəng" melodiyası. Qaytarılan funksiya dayandırır.
export function startRingback() {
  beep([425], 1);
  const id = setInterval(() => beep([425], 1), 4000);
  return () => clearInterval(id);
}

export function startRingtone() {
  const play = () => {
    beep([880, 1100], 0.35);
    setTimeout(() => beep([880, 1100], 0.35), 450);
  };
  play();
  const id = setInterval(play, 2200);
  return () => clearInterval(id);
}
