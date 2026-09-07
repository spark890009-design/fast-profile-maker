import { Link } from "react-router-dom";
import { Wand2 } from "lucide-react";
import type { Clip } from "@/lib/clipora/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClipPlayer from "@/components/ClipPlayer";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden">
      <div className="relative aspect-[9/16]">
        <ClipPlayer clip={clip} preview className="absolute inset-0" />
        <Link to={`/clips/${clip.id}`} className="absolute top-0 inset-x-0 h-14" aria-label={clip.title} />
        <span className="absolute top-2 left-2 text-[11px] font-display font-bold px-2 py-1 rounded-full bg-background/75">
          {clip.score}
        </span>
        <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-background/75">{clip.duration}s</span>
      </div>
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
