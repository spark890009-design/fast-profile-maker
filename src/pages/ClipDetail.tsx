import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Download, RefreshCw, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import ClipPlayer from "@/components/ClipPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useClips, useExports, useProjects } from "@/lib/clipora/store";
import { CAPTION_STYLES, PLATFORM_PRESETS } from "@/lib/clipora/constants";
import { backendConfigured, regenerateHooks, requestRender } from "@/lib/clipora/aiService";
import { canDownload, downloadClip } from "@/lib/clipora/clipExporter";
import type { ClipPlatform } from "@/lib/clipora/types";


export default function ClipDetail() {
  const { id } = useParams();
  const { allClips, update } = useClips();
  const { add } = useExports();
  const clip = allClips.find((c) => c.id === id);
  const [busy, setBusy] = useState(false);

  if (!clip) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center glass rounded-3xl m-4">
          <p className="font-display font-semibold">Clip not found</p>
          <Button asChild className="mt-4"><Link to="/clips">Back to clips</Link></Button>
        </div>
      </AppShell>
    );
  }

  const style = CAPTION_STYLES.find((s) => s.id === clip.captionStyle) ?? CAPTION_STYLES[0];

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const regen = async () => {
    setBusy(true);
    try {
      const next = await regenerateHooks(clip);
      update(clip.id, { title: next.title, hook: next.hook, caption: next.caption, description: next.description });
      toast.success(next.simulated ? "New hook (preview data)" : "New hook generated");
    } catch {
      toast.error("Could not regenerate");
    } finally {
      setBusy(false);
    }
  };

  const exportClip = async (platform: ClipPlatform) => {
    setBusy(true);
    try {
      await requestRender({ clipId: clip.id, resolution: "1080p", fps: 30, format: "MP4", bitrateMbps: 12, upscale: false });
      add({
        id: crypto.randomUUID(), clipId: clip.id, clipTitle: clip.title, resolution: "1080p", fps: 30,
        format: "MP4", bitrateMbps: 12, platform, createdAt: new Date().toISOString(),
        status: backendConfigured ? "queued" : "done",
      });
      toast.success(backendConfigured ? `Render queued for ${platform}` : `Export saved for ${platform} (preview mode)`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/clips"><ArrowLeft className="w-4 h-4 mr-1" /> Clips</Link></Button>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div>
            <ClipPlayer clip={clip} className="rounded-3xl glass aspect-[9/16]" />
            <Button asChild className="w-full mt-3 gradient-brand text-primary-foreground border-0">
              <Link to={`/editor/${clip.id}`}><Wand2 className="w-4 h-4 mr-1" /> Open in editor</Link>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display font-extrabold text-2xl">{clip.title}</h1>
                <span className="font-display font-extrabold text-2xl text-gradient">{clip.score}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{clip.reason}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{clip.platform}</Badge>
                <Badge variant="secondary">{clip.duration}s</Badge>
                <Badge variant="secondary">{style.name} captions</Badge>
              </div>
              <Button size="sm" variant="outline" className="mt-4" disabled={busy} onClick={regen}>
                {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                Regenerate hook
              </Button>
            </div>

            <div className="glass rounded-2xl p-5 space-y-3">
              <h2 className="font-display font-semibold">Post copy</h2>
              <Textarea value={clip.caption} onChange={(e) => update(clip.id, { caption: e.target.value })} rows={2} />
              <Textarea value={clip.description} onChange={(e) => update(clip.id, { description: e.target.value })} rows={3} />
              <div className="flex flex-wrap gap-2">
                {clip.hashtags.map((h) => <Badge key={h} variant="outline">#{h}</Badge>)}
              </div>
              <Button size="sm" variant="outline" onClick={() => copy(`${clip.caption}\n\n${clip.hashtags.map((h) => `#${h}`).join(" ")}`)}>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy caption + hashtags
              </Button>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-display font-semibold">Export</h2>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                {PLATFORM_PRESETS.map((p) => (
                  <Button key={p.id} variant="outline" className="justify-between" disabled={busy}
                    onClick={() => exportClip(p.name as ClipPlatform)}>
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.ratio} · {p.bitrate}</span>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                {backendConfigured ? "Renders run on your configured backend." : "Preview mode — exports are recorded but no file is rendered."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
