import { useCallback, useEffect, useState } from "react";
import type { Clip, ExportJob, Project } from "./types";

const KEYS = {
  projects: "clipora.projects",
  clips: "clipora.clips",
  exports: "clipora.exports",
  plan: "clipora.plan",
  settings: "clipora.settings",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("clipora-store", { detail: key }));
}

/** Generic reactive slice backed by localStorage. */
function useSlice<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    window.addEventListener("clipora-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("clipora-store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback((next: T) => write(key, next), [key]);
  return [value, set] as const;
}

export function useProjects() {
  const [projects, setProjects] = useSlice<Project[]>(KEYS.projects, []);

  const upsert = (project: Project) => {
    const rest = projects.filter((p) => p.id !== project.id);
    setProjects([project, ...rest]);
  };

  const remove = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    write(KEYS.clips, read<Clip[]>(KEYS.clips, []).filter((c) => c.projectId !== id));
  };

  const rename = (id: string, name: string) =>
    setProjects(projects.map((p) => (p.id === id ? { ...p, name } : p)));

  const duplicate = (id: string) => {
    const source = projects.find((p) => p.id === id);
    if (!source) return;
    const newId = crypto.randomUUID();
    const clips = read<Clip[]>(KEYS.clips, []);
    const copies = clips
      .filter((c) => c.projectId === id)
      .map((c) => ({ ...c, id: crypto.randomUUID(), projectId: newId }));
    write(KEYS.clips, [...copies, ...clips]);
    setProjects([
      { ...source, id: newId, name: `${source.name} (copy)`, createdAt: new Date().toISOString(), clipIds: copies.map((c) => c.id) },
      ...projects,
    ]);
  };

  return { projects, upsert, remove, rename, duplicate };
}

export function useClips(projectId?: string) {
  const [clips, setClips] = useSlice<Clip[]>(KEYS.clips, []);
  const scoped = projectId ? clips.filter((c) => c.projectId === projectId) : clips;

  const addMany = (next: Clip[]) => setClips([...next, ...clips]);
  const update = (id: string, patch: Partial<Clip>) =>
    setClips(clips.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => setClips(clips.filter((c) => c.id !== id));

  return { clips: scoped, allClips: clips, addMany, update, remove };
}

export function useExports() {
  const [jobs, setJobs] = useSlice<ExportJob[]>(KEYS.exports, []);
  const add = (job: ExportJob) => setJobs([job, ...jobs]);
  const update = (id: string, patch: Partial<ExportJob>) =>
    setJobs(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  return { jobs, add, update };
}

export function usePlan() {
  const [plan, setPlan] = useSlice<"free" | "pro">(KEYS.plan, "free");
  return { plan, setPlan };
}

export interface CliporaSettings {
  defaultResolution: string;
  defaultFps: number;
  defaultCaptionStyle: string;
  language: string;
  autoDeleteHours: number;
  notifications: boolean;
  analytics: boolean;
}

export const DEFAULT_SETTINGS: CliporaSettings = {
  defaultResolution: "1080p",
  defaultFps: 30,
  defaultCaptionStyle: "creator",
  language: "English (US)",
  autoDeleteHours: 24,
  notifications: true,
  analytics: false,
};

export function useSettings() {
  const [settings, setSettings] = useSlice<CliporaSettings>(KEYS.settings, DEFAULT_SETTINGS);
  const patch = (next: Partial<CliporaSettings>) => setSettings({ ...settings, ...next });
  return { settings: { ...DEFAULT_SETTINGS, ...settings }, patch };
}

export const storeKeys = KEYS;
