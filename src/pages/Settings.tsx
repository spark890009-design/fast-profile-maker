import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import { AVATAR_PRESETS, getAvatar, setAvatar, clearAvatar } from "@/lib/avatars";
import { toast } from "sonner";

const Settings = () => {
  const { session, ready } = useAuthGuard();
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (session) setSelected(getAvatar(session.user.id));
  }, [session]);

  if (!ready || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const uid = session.user.id;

  const pick = (url: string) => {
    setAvatar(uid, url);
    setSelected(url);
    toast.success("Profile picture updated");
  };

  const reset = () => {
    clearAvatar(uid);
    setSelected(null);
    toast.success("Profile picture removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => nav("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <span className="font-bold text-lg text-gradient">Settings</span>
          <div className="w-16" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Choose Profile Picture</CardTitle>
            {selected && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map((a) => {
                const active = selected === a.url;
                return (
                  <button
                    key={a.id}
                    onClick={() => pick(a.url)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all hover-scale ${
                      active ? "border-primary ring-2 ring-primary/40" : "border-border"
                    }`}
                    aria-label={`Select avatar ${a.label}`}
                  >
                    <img src={a.url} alt={a.label} className="w-full aspect-square bg-secondary" loading="lazy" />
                    {active && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="text-xs text-center py-1 bg-card/80 backdrop-blur">{a.label}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Anime-style avatars powered by DiceBear. Your choice is saved on this device.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
