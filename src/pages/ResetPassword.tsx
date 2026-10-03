import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.string().min(6, "Password kam se kam 6 characters ka rakhein").max(72);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(window.location.hash.includes("type=recovery"));

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!recovery) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const checked = schema.safeParse(password);
    if (!checked.success) return toast.error(checked.error.issues[0]?.message ?? "Password check karein");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: checked.data });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Naya password save ho gaya");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background px-5 flex items-center justify-center">
      <Card className="w-full max-w-sm p-6 space-y-5">
        <div className="mx-auto h-12 w-12 rounded-full bg-secondary text-primary flex items-center justify-center"><LockKeyhole /></div>
        <div className="text-center"><h1 className="font-display text-2xl font-bold">Naya password</h1><p className="text-sm text-muted-foreground mt-1">Apne account ke liye naya password banayein</p></div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={6} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button className="w-full" type="submit" disabled={busy}>{busy ? "Saving…" : "Password save karein"}</Button>
        </form>
      </Card>
    </div>
  );
}