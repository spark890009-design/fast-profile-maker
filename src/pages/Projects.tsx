import { Link } from "react-router-dom";
import { Copy, Film, Trash2, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useClips, useProjects } from "@/lib/clipora/store";

export default function Projects() {
  const { projects, remove, duplicate } = useProjects();
  const { allClips } = useClips();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-3xl">Projects</h1>
            <p className="text-muted-foreground mt-1">Every video you've analysed.</p>
          </div>
          <Button asChild className="gradient-brand text-primary-foreground border-0">
            <Link to="/studio"><Plus className="w-4 h-4 mr-1" /> New</Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center mt-8">
            <Film className="w-8 h-8 mx-auto text-primary" />
            <p className="mt-3 font-display font-semibold">No projects yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first long video to get started.</p>
            <Button asChild className="mt-5 gradient-brand text-primary-foreground border-0"><Link to="/studio">Create shorts</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {projects.map((p) => {
              const count = allClips.filter((c) => c.projectId === p.id).length;
              return (
                <div key={p.id} className="glass glass-hover rounded-2xl overflow-hidden">
                  <Link to={`/projects/${p.id}`}>
                    <div className="h-28" style={{ background: `linear-gradient(140deg, hsl(${p.thumbnailHue} 90% 55% / .45), hsl(${(p.thumbnailHue + 70) % 360} 90% 60% / .3))` }} />
                  </Link>
                  <div className="p-4">
                    <Link to={`/projects/${p.id}`} className="font-semibold line-clamp-1 hover:text-primary">{p.name}</Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count} clips · {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => duplicate(p.id)}><Copy className="w-3.5 h-3.5 mr-1" /> Duplicate</Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
