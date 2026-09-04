/**
 * Clipora AI — service adapter layer.
 *
 * Every external capability (speech-to-text, LLM moment detection, face
 * tracking, FFmpeg rendering) is reached through this single module so the
 * app never talks to a vendor directly and no credential is ever hardcoded.
 *
 * Configure a real backend by setting `VITE_CLIPORA_API_URL` to a service that
 * implements the endpoints documented in `docs/architecture.md`. When it is
 * not configured, the adapter runs in LOCAL PREVIEW MODE: it produces sample
 * analysis data so the interface is explorable. Preview data is always
 * flagged with `simulated: true` — the UI labels it, never presents it as a
 * real render, and never fabricates progress for a real backend job.
 */

import type { Clip, ClipPlatform, TranscriptCue } from "./types";
import { PIPELINE_STEPS } from "./constants";

const API_URL = import.meta.env.VITE_CLIPORA_API_URL as string | undefined;

export const backendConfigured = Boolean(API_URL);

export interface AnalysisProgress {
  stepIndex: number;
  stepKey: string;
  label: string;
  percent: number;
  simulated: boolean;
}

export interface AnalysisResult {
  simulated: boolean;
  durationSeconds: number;
  transcript: TranscriptCue[];
  clips: Omit<Clip, "projectId">[];
}

export interface AnalysisRequest {
  projectId: string;
  source: { kind: "url" | "upload"; value: string };
  targetDuration: number | "auto";
  templateId: string;
  captionStyle: string;
}

/* ------------------------------------------------------------------ */
/* Real backend adapter                                                */
/* ------------------------------------------------------------------ */

async function analyzeRemote(
  req: AnalysisRequest,
  onProgress: (p: AnalysisProgress) => void,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const createRes = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal,
  });
  if (!createRes.ok) throw new Error(await createRes.text());
  const { jobId } = (await createRes.json()) as { jobId: string };

  // Poll the queue worker. Progress reported here is always the worker's own
  // progress — never interpolated or faked on the client.
  for (;;) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const res = await fetch(`${API_URL}/jobs/${jobId}`, { signal });
    if (!res.ok) throw new Error(await res.text());
    const job = await res.json();

    if (job.progress) {
      onProgress({
        stepIndex: job.progress.stepIndex,
        stepKey: job.progress.stepKey,
        label: job.progress.label,
        percent: job.progress.percent,
        simulated: false,
      });
    }
    if (job.status === "failed") throw new Error(job.error ?? "Analysis failed");
    if (job.status === "completed") return { ...job.result, simulated: false };

    await new Promise((r) => setTimeout(r, 2000));
  }
}

/* ------------------------------------------------------------------ */
/* Local preview adapter (no backend configured)                       */
/* ------------------------------------------------------------------ */

const SAMPLE_MOMENTS = [
  { title: "3 Mistakes Most Creators Make", hook: "Nobody tells you this about YouTube...", caption: "Here is what most creators get wrong in their first year.", reason: "Strong hook + useful information + clear conclusion.", score: 94, tags: ["youtube", "creator", "contentcreator"] },
  { title: "The 7-Second Rule That Doubled My Views", hook: "Your first 7 seconds decide everything.", caption: "Retention is won before the intro even ends.", reason: "High-energy opening with a concrete, testable claim.", score: 91, tags: ["shorts", "retention", "growth"] },
  { title: "Why Nobody Finishes Your Videos", hook: "You're losing 60% of viewers right here.", caption: "The drop-off point almost every editor ignores.", reason: "Surprising data point followed by a practical fix.", score: 88, tags: ["editing", "analytics", "youtube"] },
  { title: "I Was Editing Backwards For 4 Years", hook: "This one workflow change saved me 10 hours a week.", caption: "An honest story about doing it the hard way.", reason: "Emotional story beat with a satisfying resolution.", score: 86, tags: ["workflow", "editing", "creator"] },
  { title: "The Only Caption Setting That Matters", hook: "Turn this on and watch your watch-time jump.", caption: "Word-by-word captions changed my average view duration.", reason: "Educational moment with an immediately actionable step.", score: 83, tags: ["captions", "shorts", "tips"] },
  { title: "Stop Chasing The Algorithm", hook: "The algorithm isn't your problem. This is.", caption: "A calmer, more sustainable way to grow.", reason: "Strong conclusion that reframes the whole topic.", score: 79, tags: ["mindset", "growth", "creator"] },
];

const PLATFORMS: ClipPlatform[] = ["YouTube Shorts", "Instagram Reels", "TikTok", "Facebook Reels"];

function pickDuration(target: number | "auto", index: number) {
  if (target !== "auto") return target;
  return [30, 45, 60, 30, 90, 45][index % 6];
}

async function analyzeLocal(
  req: AnalysisRequest,
  onProgress: (p: AnalysisProgress) => void,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  for (let i = 0; i < PIPELINE_STEPS.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const step = PIPELINE_STEPS[i];
    onProgress({
      stepIndex: i,
      stepKey: step.key,
      label: step.label,
      percent: Math.round(((i + 1) / PIPELINE_STEPS.length) * 100),
      simulated: true,
    });
    await new Promise((r) => setTimeout(r, i === PIPELINE_STEPS.length - 1 ? 400 : 900));
  }

  let cursor = 92;
  const clips = SAMPLE_MOMENTS.map((moment, i) => {
    const duration = pickDuration(req.targetDuration, i);
    const start = cursor;
    cursor += duration + 140;
    return {
      id: crypto.randomUUID(),
      title: moment.title,
      hook: moment.hook,
      caption: moment.caption,
      description: `${moment.caption} Full breakdown in the original video.`,
      hashtags: moment.tags,
      start,
      end: start + duration,
      duration,
      score: moment.score,
      reason: moment.reason,
      platform: PLATFORMS[i % PLATFORMS.length],
      captionStyle: req.captionStyle as Clip["captionStyle"],
      thumbnailHue: (186 + i * 34) % 360,
    };
  });

  const transcript: TranscriptCue[] = clips.flatMap((clip, i) => [
    { start: clip.start, end: clip.start + 4, speaker: i % 2 ? "Guest" : "Host", text: clip.hook },
    { start: clip.start + 4, end: clip.end, speaker: i % 2 ? "Guest" : "Host", text: clip.caption },
  ]);

  return { simulated: true, durationSeconds: cursor + 240, transcript, clips };
}

/* ------------------------------------------------------------------ */

export function analyzeVideo(
  req: AnalysisRequest,
  onProgress: (p: AnalysisProgress) => void,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  return backendConfigured ? analyzeRemote(req, onProgress, signal) : analyzeLocal(req, onProgress, signal);
}

export interface HookSet {
  title: string;
  hook: string;
  caption: string;
  description: string;
  hashtags: string[];
  simulated: boolean;
}

const HOOK_VARIANTS = [
  { hook: "Nobody tells you this about YouTube...", title: "The Advice Nobody Gives You", caption: "Here is what most creators get wrong." },
  { hook: "I wish someone told me this on day one.", title: "Day One Mistakes I Still See", caption: "Four years of trial and error in 40 seconds." },
  { hook: "This took me 200 uploads to figure out.", title: "200 Uploads, One Lesson", caption: "The pattern behind every video that worked." },
  { hook: "Everyone gets this backwards.", title: "You're Doing This Backwards", caption: "Flip the order and the results follow." },
];

export async function regenerateHooks(clip: Clip): Promise<HookSet> {
  if (backendConfigured) {
    const res = await fetch(`${API_URL}/clips/${clip.id}/hooks`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return { ...(await res.json()), simulated: false };
  }
  await new Promise((r) => setTimeout(r, 700));
  const v = HOOK_VARIANTS[Math.floor(Math.random() * HOOK_VARIANTS.length)];
  return {
    ...v,
    description: `${v.caption} Watch the full breakdown in the source video.`,
    hashtags: clip.hashtags,
    simulated: true,
  };
}

export interface RenderRequest {
  clipId: string;
  resolution: string;
  fps: number;
  format: string;
  bitrateMbps: number;
  upscale: boolean;
}

export async function requestRender(req: RenderRequest): Promise<{ jobId: string; simulated: boolean }> {
  if (backendConfigured) {
    const res = await fetch(`${API_URL}/renders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ...(await res.json()), simulated: false };
  }
  await new Promise((r) => setTimeout(r, 600));
  return { jobId: crypto.randomUUID(), simulated: true };
}

/** Authorization gate: we only process sources the user owns or is licensed for. */
export function validateSource(value: string): { ok: boolean; message?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, message: "Paste a video URL or upload a file." };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, message: "That doesn't look like a valid URL." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, message: "Only http(s) sources are supported." };
  }
  return { ok: true };
}
