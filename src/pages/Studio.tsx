import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Link2, Loader2, Check, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAPTION_STYLES, DURATION_PRESETS, PIPELINE_STEPS, TEMPLATES } from "@/lib/clipora/constants";
import { analyzeVideo, backendConfigured, validateSource, type AnalysisProgress } from "@/lib/clipora/aiService";
import { useClips, useProjects } from "@/lib/clipora/store";
import type { Clip, Project } from "@/lib/clipora/types";
import { cn } from "@/lib/utils";

export default function Studio() {
  const nav = useNavigate();
  const { upsert } = useProjects();
  const { addMany } = useClips();
  const fileRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | "auto">("auto");
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [captionStyle, setCaptionStyle] = useState(CAPTION_STYLES[0].id);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [running, setRunning] = useState(false);

  const start = async (kind: "url" | "upload") => {
    if (running) return;
    const value = kind === "url" ? url.trim() : file?.name ?? "";
    if (kind === "url") {
      const check = validateSource(value);
      if (!check.ok) return toast.error(check.message);
    } else if (!file) {
      return toast.error("Choose a video file first.");
    }


    const projectId = crypto.randomUUID();
    setRunning(true);
    setProgress(null);
    try {
      if (kind === "upload" && file) await saveVideo(projectId, file);
      const result = await analyzeVideo(
        { projectId, source: { kind, value }, targetDuration: duration, templateId, captionStyle },
        setProgress,
      );
      const clips: Clip[] = result.clips.map((c) => ({ ...c, projectId, captionStyle }));

      const project: Project = {
        id: projectId,
        name: kind === "url" ? value.replace(/^https?:\/\//, "").slice(0, 48) : value,
        source: { kind, value },
        createdAt: new Date().toISOString(),
        durationSeconds: result.durationSeconds,
        status: "ready",
        clipIds: clips.map((c) => c.id),
        templateId,
        thumbnailHue: Math.floor(Math.random() * 360),
      };
      addMany(clips);
      upsert(project);
      toast.success(`${clips.length} clips ready`);
      nav(`/projects/${projectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Create shorts</h1>
          <p className="text-muted-foreground mt-1">Add a long video and let the AI find the moments worth posting.</p>
        </div>

        {!backendConfigured && (
          <div className="glass rounded-2xl p-4 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-muted-foreground">
              Preview mode: no render backend is connected yet, so analysis returns sample data and clips are
              labelled <span className="text-foreground font-medium">Simulated</span>. Set
              <code className="mx-1 text-foreground">VITE_CLIPORA_API_URL</code> to process real video.
            </p>
          </div>
        )}

        <div className="glass rounded-3xl p-5 sm:p-6">
          <Tabs defaultValue="url">
            <TabsList className="grid grid-cols-2 w-full max-w-sm">
              <TabsTrigger value="url"><Link2 className="w-4 h-4 mr-1.5" /> Video link</TabsTrigger>
              <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1.5" /> Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-5 space-y-3">
              <Label htmlFor="src">Paste a link to a video you own</Label>
              <Input id="src" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Button disabled={running} onClick={() => start("url")} className="gradient-brand text-primary-foreground border-0">
                {running ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                Analyse video
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-border rounded-2xl py-10 text-center hover:border-primary/50 transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto text-primary" />
                <p className="mt-2 text-sm">{file ? file.name : "Click to choose an MP4, MOV or WebM"}</p>
              </button>
              <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Button disabled={running} onClick={() => start("upload")} className="gradient-brand text-primary-foreground border-0">
                {running ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                Analyse video
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold">Clip length</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {(["auto", ...DURATION_PRESETS] as const).map((d) => (
                <button
                  key={String(d)}
                  onClick={() => setDuration(d as number | "auto")}
                  className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
                    duration === d ? "border-primary text-foreground bg-secondary" : "border-border text-muted-foreground hover:text-foreground")}
                >
                  {d === "auto" ? "Auto" : `${d}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold">Caption style</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {CAPTION_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCaptionStyle(s.id)}
                  className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
                    captionStyle === s.id ? "border-primary text-foreground bg-secondary" : "border-border text-muted-foreground hover:text-foreground")}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display font-semibold">Template</h2>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={cn("rounded-xl p-3 text-left border transition-colors",
                  templateId === t.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40")}
              >
                <div className="h-10 rounded-lg mb-2" style={{ background: `linear-gradient(120deg, ${t.palette[0]}, ${t.palette[1]})` }} />
                <span className="text-sm font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {(running || progress) && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{progress?.label ?? "Starting…"}</span>
              <span className="text-muted-foreground">{progress?.percent ?? 0}%</span>
            </div>
            <Progress value={progress?.percent ?? 0} className="mt-3" />
            <ul className="mt-4 grid sm:grid-cols-3 gap-2 text-sm">
              {PIPELINE_STEPS.map((s, i) => {
                const done = (progress?.stepIndex ?? -1) > i;
                const active = progress?.stepIndex === i;
                return (
                  <li key={s.key} className={cn("flex items-center gap-2", done ? "text-foreground" : active ? "text-primary" : "text-muted-foreground")}>
                    {done ? <Check className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 rounded-full border border-border" />}
                    {s.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
