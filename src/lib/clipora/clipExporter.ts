/**
 * Client-side clip cutter.
 *
 * Takes the project's source video (uploaded file in IndexedDB or a direct
 * video URL), cuts the clip window, re-frames it to 9:16 and burns the caption
 * in, then hands back a downloadable file. Works fully in the browser — no
 * backend needed. Embedded platforms (YouTube / Vimeo) cannot be downloaded.
 */

import type { Clip, Project } from "./types";
import { getVideoBlob, isDirectVideoUrl } from "./videoStore";

export type ExportSource = { url: string; revoke: boolean } | null;

export async function resolveSource(project: Project | undefined): Promise<ExportSource> {
  if (!project) return null;
  if (project.source.kind === "upload") {
    const blob = await getVideoBlob(project.id);
    return blob ? { url: URL.createObjectURL(blob), revoke: true } : null;
  }
  return isDirectVideoUrl(project.source.value) ? { url: project.source.value, revoke: false } : null;
}

export function canDownload(project: Project | undefined): boolean {
  if (!project) return false;
  return project.source.kind === "upload" || isDirectVideoUrl(project.source.value);
}

interface CaptionPaint {
  font: string;
  color: string;
  stroke: string;
  uppercase: boolean;
  letterSpacing: number;
}

const CAPTION_PAINT: Record<string, CaptionPaint> = {
  creator: { font: "800 58px Inter, sans-serif", color: "#ffffff", stroke: "#000000", uppercase: true, letterSpacing: 0 },
  cinematic: { font: "300 42px Inter, sans-serif", color: "#f2f5ff", stroke: "rgba(0,0,0,.7)", uppercase: true, letterSpacing: 6 },
  viral: { font: "900 66px Inter, sans-serif", color: "#22d3ee", stroke: "#04121a", uppercase: true, letterSpacing: 0 },
  neon: { font: "800 56px Inter, sans-serif", color: "#c084fc", stroke: "#12021f", uppercase: true, letterSpacing: 1 },
  minimal: { font: "500 44px Inter, sans-serif", color: "#ffffff", stroke: "rgba(0,0,0,.75)", uppercase: false, letterSpacing: 0 },
  podcast: { font: "700 46px Inter, sans-serif", color: "#ffffff", stroke: "#000000", uppercase: false, letterSpacing: 0 },
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(-3);
}

export interface DownloadOptions {
  captionText?: string;
  burnCaption?: boolean;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/** Cut + render the clip and trigger a browser download. Returns the file name. */
export async function downloadClip(clip: Clip, project: Project | undefined, opts: DownloadOptions = {}): Promise<string> {
  const src = await resolveSource(project);
  if (!src) throw new Error("This clip's source can't be downloaded. Upload the video file or use a direct .mp4 link.");

  const W = 720;
  const H = 1280;
  const video = document.createElement("video");
  video.src = src.url;
  video.crossOrigin = "anonymous";
  video.playsInline = true;
  video.preload = "auto";

  const cleanup = () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
    if (src.revoke) URL.revokeObjectURL(src.url);
  };

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not read the source video."));
    });

    const start = Math.max(0, Math.min(clip.start, Math.max(0, video.duration - 0.2)));
    const end = Math.min(clip.end, video.duration);
    const span = Math.max(0.5, end - start);

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = start;
    });

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    const stream = canvas.captureStream(30);
    // Pull the audio track straight off the source element when available.
    const el = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
    try {
      const media = el.captureStream?.() ?? el.mozCaptureStream?.();
      media?.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      /* audio not capturable — export stays silent */
    }

    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) =>
      MediaRecorder.isTypeSupported(m),
    );
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    const paint = CAPTION_PAINT[clip.captionStyle] ?? CAPTION_PAINT.creator;
    const captionText = opts.captionText ?? clip.hook;
    const burn = opts.burnCaption !== false && Boolean(captionText);

    let raf = 0;
    const draw = () => {
      // cover-crop the source into a 9:16 frame
      const vw = video.videoWidth || W;
      const vh = video.videoHeight || H;
      const scale = Math.max(W / vw, H / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);

      if (burn) {
        ctx.font = paint.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const text = paint.uppercase ? captionText.toUpperCase() : captionText;
        const lines = wrap(ctx, text, W - 90);
        const lineHeight = parseInt(paint.font, 10) > 0 ? 64 : 64;
        let y = H - 140;
        for (let i = lines.length - 1; i >= 0; i--) {
          ctx.lineWidth = 10;
          ctx.strokeStyle = paint.stroke;
          ctx.strokeText(lines[i], W / 2, y);
          ctx.fillStyle = paint.color;
          ctx.fillText(lines[i], W / 2, y);
          y -= lineHeight;
        }
      }

      opts.onProgress?.(Math.min(99, Math.round(((video.currentTime - start) / span) * 100)));
      raf = requestAnimationFrame(draw);
    };

    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime ?? "video/webm" }));
    });

    recorder.start(250);
    draw();
    await video.play();

    await new Promise<void>((resolve) => {
      const tick = () => {
        if (opts.signal?.aborted || video.currentTime >= end || video.ended) return resolve();
        setTimeout(tick, 100);
      };
      tick();
    });

    cancelAnimationFrame(raf);
    video.pause();
    recorder.stop();
    const blob = await done;

    const name = `${clip.title.replace(/[^\w\-]+/g, "-").slice(0, 48) || "clip"}.webm`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    opts.onProgress?.(100);
    return name;
  } finally {
    cleanup();
  }
}
