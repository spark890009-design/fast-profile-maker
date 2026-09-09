import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Scissors, Crop, Type, Music, Image as ImageIcon, Sparkles, Play, Pause,
  SkipBack, SkipForward, Save, Wand2, Download, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import ClipPlayer from "@/components/ClipPlayer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useClips, useProjects } from "@/lib/clipora/store";
import { CAPTION_STYLES } from "@/lib/clipora/constants";
import { downloadClip } from "@/lib/clipora/clipExporter";
import { cn } from "@/lib/utils";


const TOOLS = [
  { id: "trim", label: "Trim", icon: Scissors },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "captions", label: "Captions", icon: Type },
  { id: "audio", label: "Audio", icon: Music },
  { id: "broll", label: "B-roll", icon: ImageIcon },
  { id: "effects", label: "Effects", icon: Sparkles },
];

export default function Editor() {
  const { clipId } = useParams();
  const { allClips, update } = useClips();
  const clip = allClips.find((c) => c.id === clipId) ?? allClips[0];
  const [tool, setTool] = useState("trim");
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [zoom, setZoom] = useState([1.0]);
  const [volume, setVolume] = useState([80]);
  const [autoFrame, setAutoFrame] = useState(true);

  if (!clip) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto m-4 glass rounded-3xl p-12 text-center">
          <Wand2 className="w-8 h-8 mx-auto text-primary" />
          <p className="mt-3 font-display font-semibold">Nothing to edit yet</p>
          <p className="text-sm text-muted-foreground mt-1">Analyse a video first, then open any clip here.</p>
          <Button asChild className="mt-5 gradient-brand text-primary-foreground border-0"><Link to="/studio">Create shorts</Link></Button>
        </div>
      </AppShell>
    );
  }

  const style = CAPTION_STYLES.find((s) => s.id === clip.captionStyle) ?? CAPTION_STYLES[0];

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display font-extrabold text-2xl line-clamp-1">{clip.title}</h1>
            <p className="text-xs text-muted-foreground">{clip.duration}s · {clip.platform}</p>
          </div>
          <Button className="gradient-brand text-primary-foreground border-0" onClick={() => toast.success("Edit saved")}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>

        <div className="grid lg:grid-cols-[80px_1fr_300px] gap-4">
          <div className="flex lg:flex-col gap-2 overflow-x-auto">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTool(id)}
                className={cn("flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-[11px] border transition-colors shrink-0",
                  tool === id ? "border-primary bg-secondary text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="glass rounded-3xl p-4 flex justify-center">
              <div className="w-[240px] aspect-[9/16] rounded-2xl overflow-hidden" style={{ transform: `scale(${zoom[0]})` }}>
                <ClipPlayer clip={clip} className="w-full h-full" />
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setPlayhead(0)}><SkipBack className="w-4 h-4" /></Button>
                <Button size="icon" className="gradient-brand text-primary-foreground border-0" onClick={() => setPlaying((p) => !p)}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPlayhead(clip.duration)}><SkipForward className="w-4 h-4" /></Button>
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  {playhead.toFixed(1)}s / {clip.duration}s
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="relative h-14 rounded-xl bg-secondary/60 overflow-hidden flex">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="flex-1 border-r border-background/40"
                      style={{ background: `linear-gradient(180deg, hsl(${(clip.thumbnailHue + i * 8) % 360} 80% 50% / .35), transparent)` }} />
                  ))}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-primary" style={{ left: `${(playhead / clip.duration) * 100}%` }} />
                </div>
                <div className="h-8 rounded-xl bg-secondary/40 flex items-center gap-0.5 px-2">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <span key={i} className="flex-1 bg-primary/50 rounded-full" style={{ height: `${8 + Math.abs(Math.sin(i)) * 16}px` }} />
                  ))}
                </div>
                <div className="h-8 rounded-xl bg-secondary/40 flex items-center px-3 text-xs text-muted-foreground">
                  Captions · {style.name}
                </div>
                <Slider value={[playhead]} max={clip.duration} step={0.1} onValueChange={(v) => setPlayhead(v[0])} />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 space-y-5 h-fit">
            <h2 className="font-display font-semibold capitalize">{tool} settings</h2>

            {tool === "trim" && (
              <>
                <div><Label className="text-xs">Start · {clip.start.toFixed(0)}s</Label>
                  <Slider value={[clip.start]} max={clip.end} step={1} onValueChange={(v) => update(clip.id, { start: v[0], duration: Math.round(clip.end - v[0]) })} className="mt-2" /></div>
                <div><Label className="text-xs">End · {clip.end.toFixed(0)}s</Label>
                  <Slider value={[clip.end]} min={clip.start} max={clip.start + 180} step={1} onValueChange={(v) => update(clip.id, { end: v[0], duration: Math.round(v[0] - clip.start) })} className="mt-2" /></div>
              </>
            )}

            {tool === "crop" && (
              <>
                <div><Label className="text-xs">Zoom · {zoom[0].toFixed(2)}x</Label>
                  <Slider value={zoom} min={1} max={1.6} step={0.01} onValueChange={setZoom} className="mt-2" /></div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Auto face framing</Label>
                  <Switch checked={autoFrame} onCheckedChange={setAutoFrame} />
                </div>
              </>
            )}

            {tool === "captions" && (
              <div className="grid grid-cols-2 gap-2">
                {CAPTION_STYLES.map((s) => (
                  <button key={s.id} onClick={() => update(clip.id, { captionStyle: s.id })}
                    className={cn("rounded-xl p-2 text-xs border text-left", clip.captionStyle === s.id ? "border-primary bg-secondary" : "border-border text-muted-foreground")}>
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {tool === "audio" && (
              <div><Label className="text-xs">Original volume · {volume[0]}%</Label>
                <Slider value={volume} max={100} onValueChange={setVolume} className="mt-2" /></div>
            )}

            {tool === "broll" && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <button key={i} onClick={() => toast.success("B-roll added to timeline")}
                    className="aspect-square rounded-lg border border-border hover:border-primary/50"
                    style={{ background: `linear-gradient(140deg, hsl(${i * 55} 80% 55% / .4), transparent)` }} />
                ))}
              </div>
            )}

            {tool === "effects" && (
              <div className="space-y-2">
                {["Slow zoom", "Shake on beat", "Glitch cut", "Light leak", "Film grain"].map((e) => (
                  <div key={e} className="flex items-center justify-between">
                    <Label className="text-xs">{e}</Label>
                    <Switch onCheckedChange={() => toast.success(`${e} toggled`)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
