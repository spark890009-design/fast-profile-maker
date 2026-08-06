import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, BellRing, Check, Loader2, Trash2, Volume2 } from "lucide-react";
import { AVATAR_PRESETS, getAvatar, setAvatar, clearAvatar } from "@/lib/avatars";
import { isSoundEnabled, playRing, primeSound, setSoundEnabled } from "@/lib/sound";
import { registerPush, testDeviceNotification } from "@/lib/push";
import { toast } from "sonner";

const Settings = () => {
  const { session, ready } = useAuthGuard();
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [sound, setSound] = useState(true);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>("default");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (session) setSelected(getAvatar(session.user.id));
    setSound(isSoundEnabled());
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BellRing className="w-4 h-4 text-primary" /> Alerts & Sound
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> Ring on updates</div>
                <p className="text-xs text-muted-foreground">
                  Play a chime when a withdrawal is approved / rejected or admin credits / debits your wallet.
                </p>
              </div>
              <Switch
                checked={sound}
                onCheckedChange={(v) => {
                  primeSound();
                  setSoundEnabled(v);
                  setSound(v);
                  if (v) { playRing("success"); toast.success("Ring alerts enabled"); }
                  else toast.message("Ring alerts disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-2"><Bell className="w-4 h-4" /> Browser notifications</div>
                <p className="text-xs text-muted-foreground">
                  Desktop / mobile pop-up alerts even when app is in background.
                  Current: <span className="font-mono">{browserPerm}</span>
                </p>
              </div>
              <Button
                size="sm"
                variant={browserPerm === "granted" ? "outline" : "default"}
                disabled={registering}
                onClick={async () => {
                  if (!("Notification" in window)) return toast.error("Not supported");
                  setRegistering(true);
                  try {
                    const p = Notification.permission === "granted"
                      ? "granted"
                      : await Notification.requestPermission();
                    setBrowserPerm(p);
                    if (p !== "granted") {
                      toast.error("Blocked. Allow notifications in phone browser settings.");
                      return;
                    }
                    const registered = await registerPush(uid);
                    if (!registered) {
                      toast.error("Device registration failed. Open this page in Chrome and retry.");
                      return;
                    }
                    const tested = await testDeviceNotification();
                    if (tested) toast.success("Test notification sent — device is connected");
                    else toast.error("Phone blocked the test alert. Check Android notification settings.");
                  } finally {
                    setRegistering(false);
                  }
                }}
              >
                {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : browserPerm === "granted" ? "Repair & Test" : "Allow & Test"}
              </Button>
            </div>

            <Button variant="secondary" size="sm" onClick={() => { primeSound(); void playRing("success"); }}>
              <Volume2 className="w-4 h-4 mr-1" /> Test ring
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
