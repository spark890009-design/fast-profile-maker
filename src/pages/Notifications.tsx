import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, Loader2, CheckCircle2, XCircle, Info } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const { session, ready } = useAuthGuard();
  const nav = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${uid},user_id.is.null`)
        .order("created_at", { ascending: false });
      setNotifs((data ?? []) as Notification[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("notifications-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const row = payload.new as Notification & { user_id: string | null };
        if (row.user_id === uid || row.user_id === null) {
          setNotifs((prev) => [row, ...prev]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  if (!ready || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const iconFor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("approved")) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (t.includes("rejected")) return <XCircle className="w-5 h-5 text-red-500" />;
    if (t.includes("withdraw")) return <Bell className="w-5 h-5 text-yellow-500" />;
    return <Info className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => nav("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <span className="font-bold text-lg text-gradient flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4">
        <Card>
          <CardHeader><CardTitle className="text-base">All Updates ({notifs.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="flex justify-center py-6"><Loader2 className="animate-spin w-6 h-6 text-primary" /></div>}
            {!loading && notifs.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-6">No notifications yet.</p>
            )}
            {notifs.map((n) => (
              <div key={n.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
                <div className="mt-1">{iconFor(n.title)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{n.title}</div>
                  <div className="text-sm text-muted-foreground break-words">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;
