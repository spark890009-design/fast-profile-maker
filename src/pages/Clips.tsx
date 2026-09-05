import { useState } from "react";
import { Link } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import AppShell from "@/components/AppShell";
import ClipCard from "@/components/ClipCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClips } from "@/lib/clipora/store";
import { cn } from "@/lib/utils";

const SORTS = ["Score", "Newest", "Duration"] as const;

export default function Clips() {
  const { allClips } = useClips();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Score");

  const list = allClips
    .filter((c) => `${c.title} ${c.hook} ${c.hashtags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "Score" ? b.score - a.score : sort === "Duration" ? a.duration - b.duration : 0));

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-extrabold text-3xl">Clip library</h1>
        <div className="flex flex-wrap gap-3 mt-5">
          <Input placeholder="Search clips…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <div className="flex gap-2">
            {SORTS.map((s) => (
              <button key={s} onClick={() => setSort(s)}
                className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
                  sort === s ? "border-primary bg-secondary" : "border-border text-muted-foreground hover:text-foreground")}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center mt-8">
            <Clapperboard className="w-8 h-8 mx-auto text-primary" />
            <p className="mt-3 font-display font-semibold">No clips yet</p>
            <Button asChild className="mt-4 gradient-brand text-primary-foreground border-0"><Link to="/studio">Analyse a video</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {list.map((c) => <ClipCard key={c.id} clip={c} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
