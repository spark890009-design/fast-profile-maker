import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wallet, LogOut, ArrowUpRight, Bell, Shield, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import WalletOrb3D from "@/components/WalletOrb3D";

interface Profile { user_id: string; full_name: string; email: string; mobile: string; blocked: boolean; }
interface Withdrawal { id: string; amount: number; upi_id: string; status: string; created_at: string; }
interface Notification { id: string; title: string; message: string; is_read: boolean; created_at: string; }

const Dashboard = () => {
  const { session, isAdmin, ready } = useAuthGuard();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [latest, setLatest] = useState<Notification | null>(null);

  const loadAll = useCallback(async (uid: string) => {
    const [p, w, wd, n] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("wallets").select("balance").eq("user_id", uid).maybeSingle(),
      supabase.from("withdrawals").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").or(`user_id.eq.${uid},user_id.is.null`).order("created_at", { ascending: false }).limit(20),
    ]);
    setProfile(p.data as Profile | null);
    setBalance(Number(w.data?.balance ?? 0));
    setWithdrawals((wd.data ?? []) as Withdrawal[]);
    setNotifs((n.data ?? []) as Notification[]);
    if (p.data?.blocked) toast.error("Your account is blocked. Contact admin.");
  }, []);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    loadAll(uid);

    // Ask browser permission for push-style notifications
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const notify = (title: string, body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification(title, { body, icon: "/favicon.ico" }); } catch { /* ignore */ }
      }
    };

    const channel = supabase
      .channel("dashboard-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const row = payload.new as Notification & { user_id: string | null };
        if (row.user_id === uid || row.user_id === null) {
          setNotifs((prev) => [row, ...prev].slice(0, 20));
          setLatest(row);
          toast.message(row.title, { description: row.message });
          notify(row.title, row.message);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, () => loadAll(uid))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "wallets" }, (payload) => {
        const row = payload.new as { user_id: string; balance: number };
        if (row.user_id === uid) setBalance(Number(row.balance));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session, loadAll]);

  const enableBrowserNotifications = async () => {
    if (!("Notification" in window)) return toast.error("Browser doesn't support notifications");
    const perm = await Notification.requestPermission();
    if (perm === "granted") toast.success("Notifications enabled");
    else toast.error("Notifications blocked. Enable from browser settings.");
  };


  if (!ready || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const statusColor = (s: string) => s === "approved" ? "bg-green-500" : s === "rejected" ? "bg-red-500" : "bg-yellow-500";
  const unread = notifs.length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-gradient">SPK Wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground">
                <User className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs tracking-wider">ID {profile?.user_id ?? "--------"}</span>
            </div>
            <Button variant="ghost" size="sm" className="relative" onClick={() => nav("/notifications")}>
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>

            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => nav("/admin")}>
                <Shield className="w-4 h-4 mr-1" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); nav("/auth"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted" && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 text-sm">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-600" />
              <span>Enable notifications to get instant updates on withdrawals.</span>
            </div>
            <Button size="sm" onClick={enableBrowserNotifications} className="gradient-primary border-0">Allow</Button>
          </div>
        </div>
      )}

      {latest && (
        <div className="bg-primary/10 border-b border-primary/20 text-sm">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold">{latest.title}:</span>
              <span className="truncate text-muted-foreground">{latest.message}</span>
              <Link to="/notifications" className="ml-2 text-primary underline whitespace-nowrap">View</Link>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLatest(null)}>✕</Button>
          </div>
        </div>
      )}


      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <Card className="card-elevated gradient-primary border-0 text-primary-foreground">
          <CardContent className="p-6">
            <p className="text-sm opacity-90">Wallet Balance</p>
            <p className="text-4xl font-extrabold my-2">₹{balance.toFixed(2)}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm opacity-90">
                <div>{profile?.full_name}</div>
                <div className="font-mono">{profile?.user_id}</div>
              </div>
              <Button asChild variant="secondary">
                <Link to="/withdraw"><ArrowUpRight className="w-4 h-4 mr-1" /> Withdraw</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Withdrawal History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {withdrawals.length === 0 && <p className="text-muted-foreground text-sm">No withdrawals yet.</p>}
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <div className="font-semibold">₹{Number(w.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{w.upi_id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</div>
                  </div>
                  <Badge className={`${statusColor(w.status)} text-white capitalize`}>{w.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card id="notifications">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle></CardHeader>

            <CardContent className="space-y-2">
              {notifs.length === 0 && <p className="text-muted-foreground text-sm">No notifications.</p>}
              {notifs.map((n) => (
                <div key={n.id} className="border-b border-border pb-2 last:border-0">
                  <div className="font-semibold text-sm">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
