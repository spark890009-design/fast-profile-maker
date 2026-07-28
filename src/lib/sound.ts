// Sound alert utility — synthesized "ring" via Web Audio API (no assets)
const KEY = "spark-sound-enabled";

export const isSoundEnabled = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
};

export const setSoundEnabled = (v: boolean) => {
  localStorage.setItem(KEY, v ? "1" : "0");
  window.dispatchEvent(new CustomEvent("sound-pref-changed", { detail: v }));
};

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

// Prime the audio context on a user gesture (required by browsers)
export const primeSound = () => { getCtx(); };

type Variant = "success" | "error" | "info";

export const playRing = (variant: Variant = "info") => {
  const c = getCtx();
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
  master.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

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
    osc.stop(now + delay + 0.55);
    lfo.stop(now + delay + 0.55);
  });
};
