import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ticket { id: string; subject: string; message: string; status: string; admin_reply: string | null; created_at: string; }

const Support = () => {
  const { session, ready } = useAuthGuard();
  const nav = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (uid: string) => {
    const { data } = await supabase.from("support_tickets").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setTickets((data ?? []) as Ticket[]);
  };
  useEffect(() => { if (session) void load(session.user.id); }, [session]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || subject.trim().length < 3 || message.trim().length < 5) return toast.error("Please add complete subject and message");
    setBusy(true);
    const { error } = await supabase.from("support_tickets").insert({ user_id: session.user.id, subject: subject.trim(), message: message.trim() });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSubject(""); setMessage(""); toast.success("Support request sent"); void load(session.user.id);
  };

  if (!ready || !session) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  return <div className="min-h-screen bg-background">
    <nav className="border-b border-border bg-card"><div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => nav("/dashboard")}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button><h1 className="font-bold text-lg flex items-center gap-2"><Headphones className="w-5 h-5 text-primary" /> Support</h1></div></nav>
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <Card><CardHeader><CardTitle className="text-base">Create Support Ticket</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><div><Label>Subject</Label><Input value={subject} maxLength={120} onChange={(e) => setSubject(e.target.value)} /></div><div><Label>Message</Label><textarea value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm" /></div><Button type="submit" disabled={busy}><Send className="w-4 h-4 mr-1" /> Send</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">My Requests</CardTitle></CardHeader><CardContent className="space-y-3">{tickets.length === 0 && <p className="text-sm text-muted-foreground">No support requests.</p>}{tickets.map((t) => <div key={t.id} className="border-b border-border pb-3 last:border-0"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-sm">{t.subject}</p><Badge variant={t.status === "closed" ? "secondary" : "outline"}>{t.status}</Badge></div><p className="text-sm text-muted-foreground mt-1">{t.message}</p>{t.admin_reply && <div className="mt-2 bg-primary/10 border border-primary/20 rounded-md p-3 text-sm"><span className="font-semibold">Admin reply: </span>{t.admin_reply}</div>}<p className="text-xs text-muted-foreground mt-2">{new Date(t.created_at).toLocaleString()}</p></div>)}</CardContent></Card>
    </main>
  </div>;
};

export default Support;