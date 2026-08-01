import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Loader2, ReceiptText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction { id: string; amount: number; type: string; note: string | null; created_at: string; }

const Transactions = () => {
  const { session, ready } = useAuthGuard();
  const nav = useNavigate();
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase.from("wallet_transactions").select("*").eq("user_id", session.user.id)
      .order("created_at", { ascending: false }).then(({ data }) => {
        setItems((data ?? []) as Transaction[]);
        setLoading(false);
      });
  }, [session]);

  if (!ready || !session) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return <div className="min-h-screen bg-background">
    <nav className="border-b border-border bg-card"><div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
      <Button variant="ghost" size="sm" onClick={() => nav("/dashboard")}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <h1 className="font-bold text-lg flex items-center gap-2"><ReceiptText className="w-5 h-5 text-primary" /> Transactions</h1>
    </div></nav>
    <main className="max-w-3xl mx-auto p-4"><Card><CardHeader><CardTitle className="text-base">Wallet Ledger</CardTitle></CardHeader><CardContent className="space-y-1">
      {loading && <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>}
      {!loading && items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>}
      {items.map((item) => {
        const credit = item.type === "credit";
        return <div key={item.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${credit ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
            {credit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{item.note || (credit ? "Wallet credit" : "Wallet debit")}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p></div>
          <p className={`font-bold ${credit ? "text-green-500" : "text-red-500"}`}>{credit ? "+" : "−"}₹{Number(item.amount).toFixed(2)}</p>
        </div>;
      })}
    </CardContent></Card></main>
  </div>;
};

export default Transactions;