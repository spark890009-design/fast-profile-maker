// Sound alert utility — synthesized "ring" via Web Audio API (no assets)
const KEY = "spark-sound-enabled";

export const isSoundEnabled = () => {
  if (typeof window === "undefined") return false;
  // Alerts are on by default; users can explicitly disable them in Settings.
  return localStorage.getItem(KEY) !== "0";
};

export const setSoundEnabled = (v: boolean) => {
  localStorage.setItem(KEY, v ? "1" : "0");
  window.dispatchEvent(new CustomEvent("sound-pref-changed", { detail: v }));
};

let ctx: AudioContext | null = null;
const getCtx = async () => {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") {
    try { await ctx.resume(); } catch { return null; }
  }
  return ctx;
};

// Prime the audio context on a user gesture (required by browsers)
export const primeSound = () => { void getCtx(); };

// Browsers require one user gesture before websites may play sound. Calling this
// once at app startup unlocks audio on the user's first tap/click/key press.
export const installSoundUnlock = () => {
  if (typeof window === "undefined") return () => {};
  const unlock = () => {
    void getCtx();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
};

type Variant = "success" | "error" | "info";

export const playRing = async (variant: Variant = "info") => {
  if (!isSoundEnabled()) return false;
  const c = await getCtx();
  if (!c) return;
  const now = c.currentTime;
  // Two-note chime; frequencies depend on variant
  const notes: [number, number][] =
    variant === "success" ? [[880, 0], [1320, 0.18]]
    : variant === "error" ? [[440, 0], [330, 0.2]]
    : [[660, 0], [990, 0.16]];

  const master = c.createGain();
  master.gain.value = 0.0001;
  master.connect(c.destination);
  // Envelope: quick attack, gentle decay
  master.gain.exponentialRampToValueAtTime(0.65, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);

  notes.forEach(([freq, delay]) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    // tiny vibrato for a "ring" feel
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 6;
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain).connect(osc.frequency);
    g.gain.value = 0.9;
    osc.connect(g).connect(master);
    osc.start(now + delay);
    lfo.start(now + delay);
    osc.stop(now + delay + 0.9);
    lfo.stop(now + delay + 0.9);
  });
  return true;
};
