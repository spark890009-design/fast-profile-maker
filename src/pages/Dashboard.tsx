import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, ArrowUpRight, Bell, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!session) return;
    (async () => {
      const [p, w, wd, n] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
        supabase.from("wallets").select("balance").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("withdrawals").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").or(`user_id.eq.${session.user.id},user_id.is.null`).order("created_at", { ascending: false }).limit(10),
      ]);
      setProfile(p.data as Profile | null);
      setBalance(Number(w.data?.balance ?? 0));
      setWithdrawals((wd.data ?? []) as Withdrawal[]);
      setNotifs((n.data ?? []) as Notification[]);
      if (p.data?.blocked) toast.error("Your account is blocked. Contact admin.");
    })();
  }, [session]);

  if (!ready || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const statusColor = (s: string) => s === "approved" ? "bg-green-500" : s === "rejected" ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-gradient">SPK Wallet</span>
          </div>
          <div className="flex items-center gap-2">
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

          <Card>
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
