import AppShell from "@/components/AppShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/lib/clipora/store";
import { CAPTION_STYLES, EXPORT_RESOLUTIONS } from "@/lib/clipora/constants";
import { backendConfigured } from "@/lib/clipora/aiService";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, patch } = useSettings();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <h1 className="font-display font-extrabold text-3xl">Settings</h1>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-semibold">Export defaults</h2>
          <div>
            <Label className="text-xs">Resolution</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EXPORT_RESOLUTIONS.map((r) => (
                <button key={r} onClick={() => patch({ defaultResolution: r })}
                  className={cn("px-3 py-1.5 rounded-full text-sm border",
                    settings.defaultResolution === r ? "border-primary bg-secondary" : "border-border text-muted-foreground")}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Frame rate</Label>
            <div className="flex gap-2 mt-2">
              {[24, 30, 60].map((f) => (
                <button key={f} onClick={() => patch({ defaultFps: f })}
                  className={cn("px-3 py-1.5 rounded-full text-sm border",
                    settings.defaultFps === f ? "border-primary bg-secondary" : "border-border text-muted-foreground")}>
                  {f} fps
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Caption style</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CAPTION_STYLES.map((s) => (
                <button key={s.id} onClick={() => patch({ defaultCaptionStyle: s.id })}
                  className={cn("px-3 py-1.5 rounded-full text-sm border",
                    settings.defaultCaptionStyle === s.id ? "border-primary bg-secondary" : "border-border text-muted-foreground")}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-semibold">Workspace</h2>
          <div>
            <Label htmlFor="lang" className="text-xs">Transcript language</Label>
            <Input id="lang" value={settings.language} onChange={(e) => patch({ language: e.target.value })} className="mt-2" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Notify me when renders finish</Label>
            <Switch checked={settings.notifications} onCheckedChange={(v) => patch({ notifications: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Share anonymous usage analytics</Label>
            <Switch checked={settings.analytics} onCheckedChange={(v) => patch({ analytics: v })} />
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-display font-semibold">Processing backend</h2>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={backendConfigured ? "default" : "secondary"}>
              {backendConfigured ? "Connected" : "Preview mode"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {backendConfigured ? "Jobs run on your render service." : "Set VITE_CLIPORA_API_URL to enable real rendering."}
            </span>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
