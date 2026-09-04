import type { CaptionStyle, PipelineStep, Template } from "./types";

export const BRAND = {
  name: "CLIPORA AI",
  tagline: "Long Videos. Perfect Shorts.",
};

export const PIPELINE_STEPS: PipelineStep[] = [
  { key: "upload", label: "Uploading Video" },
  { key: "analyze", label: "Analyzing Video" },
  { key: "transcript", label: "Generating Transcript" },
  { key: "moments", label: "Finding Best Moments" },
  { key: "speakers", label: "Detecting Speakers" },
  { key: "shorts", label: "Creating Shorts" },
  { key: "captions", label: "Generating Captions" },
  { key: "optimize", label: "Optimizing Video" },
  { key: "ready", label: "Ready" },
];

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: "creator",
    name: "Creator",
    description: "Bold animated captions with punchy word pops.",
    preview: "THIS CHANGES EVERYTHING",
    className: "font-display font-extrabold uppercase tracking-tight text-foreground drop-shadow-[0_3px_0_rgba(0,0,0,0.85)]",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Elegant minimal typography, letterboxed feel.",
    preview: "the quiet part, out loud",
    className: "font-display font-light tracking-[0.22em] uppercase text-foreground/90",
  },
  {
    id: "viral",
    name: "Viral",
    description: "Oversized high-impact words, one line at a time.",
    preview: "STOP SCROLLING",
    className: "font-display font-extrabold uppercase text-3xl leading-none text-primary drop-shadow-[0_0_18px_hsl(var(--primary)/0.5)]",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Futuristic cyan/purple glowing captions.",
    preview: "built by AI",
    className: "font-display font-bold uppercase text-gradient drop-shadow-[0_0_24px_hsl(var(--accent)/0.55)]",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean professional captions, zero distraction.",
    preview: "Simple. Readable. Fast.",
    className: "font-sans font-medium text-foreground/90",
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Modern podcast subtitles with speaker labels.",
    preview: "HOST: here's the real reason",
    className: "font-sans font-semibold text-foreground bg-background/70 px-2 py-1 rounded-md",
  },
];

export const TEMPLATES: Template[] = [
  { id: "podcast", name: "Podcast", vibe: "Two-up speaker framing with warm neutrals.", captionStyle: "podcast", palette: ["#22d3ee", "#a855f7"], typography: "Sora / Manrope", layout: "Split speaker 9:16", intro: "Waveform sting" },
  { id: "motivation", name: "Motivation", vibe: "High contrast, slow zoom, orchestral beats.", captionStyle: "viral", palette: ["#f43f5e", "#a855f7"], typography: "Sora Extrabold", layout: "Center hero", intro: "Light burst" },
  { id: "education", name: "Education", vibe: "Clear structure with keyword highlights.", captionStyle: "minimal", palette: ["#22d3ee", "#38bdf8"], typography: "Manrope", layout: "Lower third", intro: "Chapter card" },
  { id: "business", name: "Business", vibe: "Confident, corporate-clean, data callouts.", captionStyle: "cinematic", palette: ["#0ea5e9", "#6366f1"], typography: "Sora", layout: "Framed subject", intro: "Line wipe" },
  { id: "gaming", name: "Gaming", vibe: "Fast cuts, kill-feed pop, energetic shake.", captionStyle: "neon", palette: ["#a855f7", "#ec4899"], typography: "Sora Bold", layout: "Facecam corner", intro: "Glitch" },
  { id: "news", name: "News", vibe: "Ticker bar, factual pacing, headline first.", captionStyle: "minimal", palette: ["#e11d48", "#f59e0b"], typography: "Manrope Semibold", layout: "Headline banner", intro: "Ticker slide" },
  { id: "comedy", name: "Comedy", vibe: "Punchline zoom with reaction stickers.", captionStyle: "creator", palette: ["#facc15", "#f97316"], typography: "Sora Extrabold", layout: "Punch-in", intro: "Boing pop" },
  { id: "storytelling", name: "Storytelling", vibe: "Slow reveals, ambient score, chapter beats.", captionStyle: "cinematic", palette: ["#8b5cf6", "#22d3ee"], typography: "Sora Light", layout: "Cinematic bars", intro: "Fade from black" },
  { id: "vlog", name: "Vlog", vibe: "Handheld energy with location tags.", captionStyle: "creator", palette: ["#34d399", "#22d3ee"], typography: "Manrope Bold", layout: "Free frame", intro: "Film burn" },
  { id: "interview", name: "Interview", vibe: "Question/answer cards with name plates.", captionStyle: "podcast", palette: ["#38bdf8", "#a855f7"], typography: "Sora / Manrope", layout: "Speaker switch", intro: "Name plate" },
];

export const PLATFORM_PRESETS = [
  { id: "youtube", name: "YouTube Shorts", ratio: "9:16", maxDuration: "60s", bitrate: "16 Mbps", codec: "H.264" },
  { id: "instagram", name: "Instagram Reels", ratio: "9:16", maxDuration: "90s", bitrate: "12 Mbps", codec: "H.264" },
  { id: "tiktok", name: "TikTok", ratio: "9:16", maxDuration: "90s", bitrate: "10 Mbps", codec: "H.264" },
  { id: "facebook", name: "Facebook Reels", ratio: "9:16", maxDuration: "90s", bitrate: "12 Mbps", codec: "H.264" },
] as const;

export const DURATION_PRESETS = [15, 30, 45, 60, 90];

export const EXPORT_RESOLUTIONS = ["720p", "1080p", "1440p", "4K UHD"] as const;
