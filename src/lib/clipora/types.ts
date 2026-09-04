export type ClipPlatform = "YouTube Shorts" | "Instagram Reels" | "TikTok" | "Facebook Reels";

export type CaptionStyleId = "creator" | "cinematic" | "viral" | "neon" | "minimal" | "podcast";

export interface CaptionStyle {
  id: CaptionStyleId;
  name: string;
  description: string;
  preview: string;
  className: string;
}

export interface TranscriptCue {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  hook: string;
  caption: string;
  description: string;
  hashtags: string[];
  start: number;
  end: number;
  duration: number;
  score: number;
  reason: string;
  platform: ClipPlatform;
  captionStyle: CaptionStyleId;
  thumbnailHue: number;
}

export type ProjectStatus = "queued" | "processing" | "ready" | "failed";

export interface Project {
  id: string;
  name: string;
  source: { kind: "url" | "upload"; value: string };
  createdAt: string;
  durationSeconds: number;
  status: ProjectStatus;
  clipIds: string[];
  templateId: string;
  thumbnailHue: number;
}

export interface ExportJob {
  id: string;
  clipId: string;
  clipTitle: string;
  resolution: "720p" | "1080p" | "1440p" | "4K UHD";
  fps: 24 | 30 | 60;
  format: "MP4" | "H.264" | "H.265/HEVC";
  bitrateMbps: number;
  platform: ClipPlatform;
  createdAt: string;
  status: "queued" | "rendering" | "done" | "failed";
}

export interface Template {
  id: string;
  name: string;
  vibe: string;
  captionStyle: CaptionStyleId;
  palette: [string, string];
  typography: string;
  layout: string;
  intro: string;
}

export interface PipelineStep {
  key: string;
  label: string;
}
