import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import ClipCard from "@/components/ClipCard";
import { Button } from "@/components/ui/button";
import { useClips, useProjects } from "@/lib/clipora/store";
import { TEMPLATES } from "@/lib/clipora/constants";

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects } = useProjects();
  const { clips } = useClips(id);
  const project = projects.find((p) => p.id === id);
  const template = TEMPLATES.find((t) => t.id === project?.templateId);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/projects"><ArrowLeft className="w-4 h-4 mr-1" /> Projects</Link></Button>
        {!project ? (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="font-display font-semibold">Project not found</p>
            <Button asChild className="mt-4"><Link to="/studio">Create a new one</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="font-display font-extrabold text-3xl break-words">{project.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {clips.length} clips · {Math.round(project.durationSeconds / 60)} min source · Template: {template?.name ?? "—"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {clips.map((c) => <ClipCard key={c.id} clip={c} />)}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
