import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Ban, CheckCircle2, XCircle, Plus, Minus, Send, Loader2, Users, Wallet, Clock, IndianRupee, Headphones, ShieldCheck, ShieldOff, Link2 } from "lucide-react";

interface UserRow {
  id: string; user_id: string; full_name: string; email: string; mobile: string; blocked: boolean;
  balance?: number;
}
interface Wd {
  id: string; user_id: string; upi_id: string; amount: number; status: string; created_at: string;
  profiles?: { full_name: string; user_id: string } | null;
}
interface Ticket { id: string; user_id: string; subject: string; message: string; status: string; admin_reply: string | null; created_at: string; }

const Admin = () => {
  const { ready, isAdmin } = useAuthGuard(true);
  const nav = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<Wd[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [groupLink, setGroupLink] = useState("");

  const loadAll = useCallback(async () => {
    const [{ data: profiles }, { data: wallets }, { data: wds }, { data: support }, { data: roles }, { data: cfg }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("wallets").select("user_id,balance"),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
      supabase.from("app_settings").select("value").eq("key", "group_link").maybeSingle(),
    ]);
    setAdminIds((roles ?? []).map((r) => r.user_id));
    setGroupLink(cfg?.value ?? "");
    const balMap = new Map((wallets ?? []).map((w) => [w.user_id, Number(w.balance)]));
    const profMap = new Map(((profiles ?? []) as UserRow[]).map((p) => [p.id, p]));
    setUsers(((profiles ?? []) as UserRow[]).map((p) => ({ ...p, balance: balMap.get(p.id) ?? 0 })));
    setWithdrawals(((wds ?? []) as Wd[]).map((w) => {
      const p = profMap.get(w.user_id);
      return { ...w, profiles: p ? { full_name: p.full_name, user_id: p.user_id } : null };
    }));
    setTickets((support ?? []) as Ticket[]);
  }, []);

  useEffect(() => { if (ready && isAdmin) loadAll(); }, [ready, isAdmin, loadAll]);

  const toggleBlock = async (u: UserRow) => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ blocked: !u.blocked }).eq("id", u.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(u.blocked ? "User unblocked" : "User blocked");
    loadAll();
  };

  const adjustBalance = async (u: UserRow, delta: number, note: string) => {
    if (!delta) return;
    setBusy(true);
    const newBal = Number((Number(u.balance ?? 0) + delta).toFixed(2));
    if (newBal < 0) { setBusy(false); return toast.error("Balance cannot go negative"); }
    const { error: e1 } = await supabase.from("wallets").update({ balance: newBal }).eq("user_id", u.id);
    if (e1) { setBusy(false); return toast.error(e1.message); }
    await supabase.from("wallet_transactions").insert({
      user_id: u.id, amount: Math.abs(delta), type: delta > 0 ? "credit" : "debit", note,
    });
    const isCredit = delta > 0;
    await supabase.from("notifications").insert({
      user_id: u.id,
      title: isCredit ? "Wallet Credited" : "Wallet Debited",
      message: `Admin has ${isCredit ? "credited" : "debited"} ₹${Math.abs(delta).toFixed(2)} ${isCredit ? "to" : "from"} your wallet. New balance: ₹${newBal.toFixed(2)}.${note ? ` Note: ${note}` : ""}`,
    });
    setBusy(false);
    toast.success("Balance updated");
    loadAll();

  };

  const resolveWithdrawal = async (w: Wd, approve: boolean) => {
    setBusy(true);
    if (approve) {
      // balance was already deducted at request time; just notify
      await supabase.from("notifications").insert({
        user_id: w.user_id, title: "Withdrawal Approved",
        message: `Your withdrawal of ₹${w.amount} to ${w.upi_id} was approved.`,
      });
    } else {
      // refund balance
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", w.user_id).maybeSingle();
      const cur = Number(wallet?.balance ?? 0);
      const refunded = Number((cur + Number(w.amount)).toFixed(2));
      await supabase.from("wallets").update({ balance: refunded }).eq("user_id", w.user_id);
      await supabase.from("wallet_transactions").insert({
        user_id: w.user_id, amount: w.amount, type: "credit",
        note: `Withdrawal rejected refund (${w.upi_id})`,
      });
      await supabase.from("notifications").insert({
        user_id: w.user_id, title: "Withdrawal Rejected",
        message: `Your withdrawal of ₹${w.amount} to ${w.upi_id} was rejected. Amount refunded to wallet.`,
      });
    }
    const { error } = await supabase.from("withdrawals").update({ status: approve ? "approved" : "rejected" }).eq("id", w.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(approve ? "Approved" : "Rejected");
    loadAll();
  };

  const PRIMARY_ADMIN_EMAIL = "rajpandey565758@gmail.com";
  const isPrimary = (u: UserRow) => u.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL;

  const setAdminRole = async (u: UserRow, make: boolean) => {
    if (isPrimary(u) && !make) return toast.error("Primary admin cannot be removed");
    setBusy(true);
    const { error } = make
      ? await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" })
      : await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
    setBusy(false);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: u.id,
      title: make ? "Admin Access Granted" : "Admin Access Removed",
      message: make ? "You are now an admin of SPARK WALLET." : "Your admin access has been removed.",
    });
    toast.success(make ? "Admin access granted" : "Admin access removed");
    loadAll();
  };

  const saveGroupLink = async (value: string) => {
    const { error } = await supabase.from("app_settings").update({ value: value.trim() }).eq("key", "group_link");
    if (error) return toast.error(error.message);
    toast.success("Group link saved");
    setGroupLink(value.trim());
  };

  const sendNotification = async (userId: string | null, title: string, message: string) => {
    if (!title || !message) return toast.error("Title and message required");
    const { error } = await supabase.from("notifications").insert({ user_id: userId, title, message });
    if (error) return toast.error(error.message);
    toast.success("Notification sent");
  };

  const replyTicket = async (ticket: Ticket, reply: string) => {
    if (reply.trim().length < 2) return toast.error("Reply required");
    const { error } = await supabase.from("support_tickets").update({ admin_reply: reply.trim(), status: "answered" }).eq("id", ticket.id);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({ user_id: ticket.user_id, title: "Support Reply", message: `Admin replied to “${ticket.subject}”: ${reply.trim()}` });
    toast.success("Reply sent"); void loadAll();
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  const pending = withdrawals.filter((w) => w.status === "pending");
  const resolved = withdrawals.filter((w) => w.status !== "pending");
  const totalBalance = users.reduce((sum, user) => sum + Number(user.balance ?? 0), 0);
  const approvedAmount = withdrawals.filter((w) => w.status === "approved").reduce((sum, w) => sum + Number(w.amount), 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => nav("/dashboard")}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
          </div>
          <BroadcastDialog onSend={(t, m) => sendNotification(null, t, m)} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat icon={<Users />} label="Total Users" value={users.length.toString()} />
          <Stat icon={<Wallet />} label="Wallet Balance" value={`₹${totalBalance.toFixed(2)}`} />
          <Stat icon={<Clock />} label="Pending" value={pending.length.toString()} />
          <Stat icon={<IndianRupee />} label="Approved" value={`₹${approvedAmount.toFixed(2)}`} />
        </div>
        <Card className="mb-4">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium min-w-[140px]"><Link2 className="w-4 h-4 text-primary" /> Group Link</div>
            <Input value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            <Button onClick={() => saveGroupLink(groupLink)}>Save</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
            <TabsTrigger value="support">Support ({tickets.filter((t) => t.status === "open").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-2 mt-4">
            <Input
              placeholder="Search by User ID (SPK1001), name, email or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
            {users
              .filter((u) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                return (
                  u.user_id?.toLowerCase().includes(q) ||
                  u.full_name?.toLowerCase().includes(q) ||
                  u.email?.toLowerCase().includes(q) ||
                  u.mobile?.toLowerCase().includes(q)
                );
              })
              .map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  <div>
                    <div className="font-semibold">{u.full_name} <span className="font-mono text-xs text-muted-foreground">({u.user_id})</span></div>
                    <div className="text-sm text-muted-foreground">{u.email} · {u.mobile}</div>
                    <div className="text-sm">Balance: <span className="font-bold text-primary">₹{(u.balance ?? 0).toFixed(2)}</span></div>
                    <div className="flex gap-1 mt-1">
                      {u.blocked && <Badge variant="destructive">Blocked</Badge>}
                      {isPrimary(u) && <Badge className="bg-primary text-primary-foreground">Primary Admin</Badge>}
                      {!isPrimary(u) && adminIds.includes(u.id) && <Badge variant="secondary">Admin</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdjustDialog user={u} onAdjust={adjustBalance} />
                    <NotifyDialog onSend={(t, m) => sendNotification(u.id, t, m)} />
                    {isPrimary(u) ? (
                      <Button size="sm" variant="outline" disabled><ShieldCheck className="w-4 h-4 mr-1" /> Primary Admin</Button>
                    ) : adminIds.includes(u.id) ? (
                      <Button size="sm" variant="outline" onClick={() => setAdminRole(u, false)} disabled={busy}><ShieldOff className="w-4 h-4 mr-1" /> Remove Admin</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setAdminRole(u, true)} disabled={busy}><ShieldCheck className="w-4 h-4 mr-1" /> Make Admin</Button>
                    )}
                    <Button size="sm" variant={u.blocked ? "outline" : "destructive"} onClick={() => toggleBlock(u)} disabled={busy}>
                      <Ban className="w-4 h-4 mr-1" /> {u.blocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-2 mt-4">
            {pending.length === 0 && <p className="text-muted-foreground">No pending requests.</p>}
            {pending.map((w) => (
              <Card key={w.id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  <div>
                    <div className="font-semibold">{w.profiles?.full_name} <span className="font-mono text-xs text-muted-foreground">({w.profiles?.user_id})</span></div>
                    <div className="text-sm">₹{Number(w.amount).toFixed(2)} → <span className="font-mono">{w.upi_id}</span></div>
                    <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => resolveWithdrawal(w, true)} disabled={busy} className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => resolveWithdrawal(w, false)} disabled={busy}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-2 mt-4">
            {resolved.map((w) => (
              <Card key={w.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{w.profiles?.full_name}</div>
                    <div className="text-sm">₹{Number(w.amount).toFixed(2)} → {w.upi_id}</div>
                  </div>
                  <Badge className={w.status === "approved" ? "bg-green-500" : "bg-red-500"}>{w.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="support" className="space-y-2 mt-4">
            {tickets.length === 0 && <p className="text-muted-foreground">No support tickets.</p>}
            {tickets.map((ticket) => <Card key={ticket.id}><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold flex items-center gap-2"><Headphones className="w-4 h-4 text-primary" />{ticket.subject}</div><p className="text-sm text-muted-foreground mt-1">{ticket.message}</p><p className="text-xs text-muted-foreground mt-2">{new Date(ticket.created_at).toLocaleString()}</p></div><Badge variant="outline">{ticket.status}</Badge></div>{ticket.admin_reply && <p className="text-sm bg-primary/10 p-2 rounded mt-3"><b>Reply:</b> {ticket.admin_reply}</p>}<TicketReply ticket={ticket} onReply={replyTicket} /></CardContent></Card>)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <Card><CardContent className="p-4 flex items-center gap-3"><div className="text-primary [&>svg]:w-5 [&>svg]:h-5">{icon}</div><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-bold">{value}</p></div></CardContent></Card>;
}

function TicketReply({ ticket, onReply }: { ticket: Ticket; onReply: (ticket: Ticket, reply: string) => void }) {
  const [reply, setReply] = useState(ticket.admin_reply ?? "");
  return <div className="flex gap-2 mt-3"><Input placeholder="Write reply..." value={reply} onChange={(e) => setReply(e.target.value)} /><Button size="sm" onClick={() => onReply(ticket, reply)}><Send className="w-4 h-4 mr-1" /> Reply</Button></div>;
}

function AdjustDialog({ user, onAdjust }: { user: UserRow; onAdjust: (u: UserRow, delta: number, note: string) => void }) {
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const handle = (sign: 1 | -1) => {
    const n = Number(amt);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    onAdjust(user, sign * n, note || (sign > 0 ? "Admin credit" : "Admin debit"));
    setOpen(false); setAmt(""); setNote("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adjust balance – {user.full_name}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} />
          <Label>Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handle(-1)}><Minus className="w-4 h-4 mr-1" /> Deduct</Button>
          <Button onClick={() => handle(1)} className="gradient-primary border-0"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotifyDialog({ onSend }: { onSend: (title: string, message: string) => void }) {
  const [title, setTitle] = useState(""); const [msg, setMsg] = useState(""); const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Send className="w-4 h-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Send notification</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <Label>Message</Label><Input value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={() => { onSend(title, msg); setOpen(false); setTitle(""); setMsg(""); }} className="gradient-primary border-0">Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BroadcastDialog({ onSend }: { onSend: (title: string, message: string) => void }) {
  const [title, setTitle] = useState(""); const [msg, setMsg] = useState(""); const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gradient-primary border-0"><Send className="w-4 h-4 mr-1" /> Broadcast</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Broadcast to all users</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <Label>Message</Label><Input value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={() => { onSend(title, msg); setOpen(false); setTitle(""); setMsg(""); }} className="gradient-primary border-0">Send to all</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Admin;
