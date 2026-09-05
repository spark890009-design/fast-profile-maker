import { Link } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CAPTION_STYLES, TEMPLATES } from "@/lib/clipora/constants";

export default function Templates() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-extrabold text-3xl">Templates</h1>
        <p className="text-muted-foreground mt-1">Ten looks tuned for different content types.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="glass glass-hover rounded-2xl overflow-hidden">
              <div className="h-24" style={{ background: `linear-gradient(130deg, ${t.palette[0]}, ${t.palette[1]})` }} />
              <div className="p-4 space-y-2">
                <h2 className="font-display font-semibold">{t.name}</h2>
                <p className="text-sm text-muted-foreground">{t.vibe}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="secondary" className="text-[10px]">{t.layout}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{t.typography}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{t.intro}</Badge>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full mt-2"><Link to="/studio">Use template</Link></Button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-display font-bold text-2xl mt-14">Caption styles</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {CAPTION_STYLES.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-5">
              <div className="h-20 rounded-xl bg-secondary/50 flex items-end p-3">
                <p className={s.className}>{s.preview}</p>
              </div>
              <h3 className="font-semibold mt-3">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
