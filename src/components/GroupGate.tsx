import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props { children: React.ReactNode }

export const GroupGate = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(true);
  const [link, setLink] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: s } = await supabase.auth.getSession();
    const id = s.session?.user.id ?? null;
    setUid(id);
    if (!id) { setLoading(false); return; }
    const [p, cfg, roles] = await Promise.all([
      supabase.from("profiles").select("joined_group").eq("id", id).maybeSingle(),
      supabase.from("app_settings").select("value").eq("key", "group_link").maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", id),
    ]);
    const isAdmin = !!roles.data?.some((r) => r.role === "admin");
    setJoined(isAdmin || !!p.data?.joined_group);
    setLink(cfg.data?.value ?? "");
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const confirmJoin = async () => {
    if (!uid) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ joined_group: true }).eq("id", uid);
    setBusy(false);
    if (error) return toast.error(error.message);
    setJoined(true);
    toast.success("Welcome! Group joined.");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (joined || !uid) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Join our group</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Joining the official SPARK WALLET group is compulsory. Join first to unlock your dashboard, wallet and withdrawals.
            </p>
          </div>

          {link ? (
            <Button
              className="w-full"
              onClick={() => { window.open(link, "_blank", "noopener,noreferrer"); setOpened(true); }}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Join This Group
            </Button>
          ) : (
            <p className="text-sm text-destructive">Group link not set yet. Please contact admin.</p>
          )}

          <Button variant="outline" className="w-full" disabled={!opened || busy} onClick={confirmJoin}>
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            I have joined — Continue
          </Button>
          {!opened && link && <p className="text-xs text-muted-foreground">Tap “Join This Group” first to continue.</p>}

          <Button variant="ghost" size="sm" className="w-full" onClick={() => supabase.auth.signOut()}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupGate;
