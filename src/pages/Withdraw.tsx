import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  upi_id: z.string().trim().regex(/^[\w.-]+@[\w.-]+$/, "Enter a valid UPI ID like name@bank").max(80),
  amount: z.coerce.number().min(10, "Minimum withdrawal is ₹10").max(1000000),
});

const Withdraw = () => {
  const { session, ready } = useAuthGuard();
  const nav = useNavigate();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase.from("wallets").select("balance").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => setBalance(Number(data?.balance ?? 0)));
  }, [session]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (parsed.data.amount > balance) { toast.error("Insufficient balance"); return; }

    setLoading(true);
    const { error } = await supabase.rpc("request_withdrawal", {
      _upi_id: parsed.data.upi_id,
      _amount: parsed.data.amount,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Withdrawal request submitted. Status: Pending");
    nav("/dashboard");
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" onClick={() => nav("/dashboard")} className="mb-4"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Withdraw via UPI</CardTitle>
            <CardDescription>Available balance: <span className="font-bold text-primary">₹{balance.toFixed(2)}</span> · Minimum ₹10</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="upi_id">UPI ID</Label>
                <Input id="upi_id" name="upi_id" placeholder="name@paytm / name@ybl / name@ibl" required />
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" min={10} step="0.01" required />
              </div>
              <Button type="submit" className="w-full gradient-primary border-0" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdraw;
