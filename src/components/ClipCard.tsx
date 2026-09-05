import { Link } from "react-router-dom";
import { Play, Wand2 } from "lucide-react";
import type { Clip } from "@/lib/clipora/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden">
      <Link to={`/clips/${clip.id}`} className="block relative aspect-[9/16]"
        style={{ background: `linear-gradient(160deg, hsl(${clip.thumbnailHue} 90% 55% / .35), hsl(${(clip.thumbnailHue + 80) % 360} 90% 60% / .25))` }}>
        <span className="absolute top-2 left-2 text-[11px] font-display font-bold px-2 py-1 rounded-full bg-background/75">
          {clip.score}
        </span>
        <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-background/75">{clip.duration}s</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-background/40">
          <Play className="w-9 h-9" />
        </div>
        <p className="absolute inset-x-3 bottom-3 text-sm font-display font-bold uppercase leading-tight drop-shadow">
          {clip.hook}
        </p>
      </Link>
      <div className="p-3 space-y-2">
        <Link to={`/clips/${clip.id}`} className="font-semibold text-sm line-clamp-2 hover:text-primary">{clip.title}</Link>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px]">{clip.platform}</Badge>
          <span className="text-[11px] text-muted-foreground">{fmt(clip.start)}–{fmt(clip.end)}</span>
        </div>
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link to={`/editor/${clip.id}`}><Wand2 className="w-3.5 h-3.5 mr-1" /> Edit</Link>
        </Button>
      </div>
    </div>
  );
}
