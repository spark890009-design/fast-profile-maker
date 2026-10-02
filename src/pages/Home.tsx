import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Droplets, CalendarCheck, CalendarX, IndianRupee, Wallet, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inr, monthKey, monthLabel, shiftMonth, summarise, useEntries, usePayments } from "@/lib/milk/data";
import { useCurrentDairy } from "@/lib/milk/useCurrentDairy";

function Stat({ icon: Icon, label, value, tone = "default" }: { icon: React.ElementType; label: string; value: string; tone?: "default" | "primary" | "danger" }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium"><Icon className="w-4 h-4" />{label}</div>
      <p className={tone === "primary" ? "text-2xl font-display font-bold text-primary" : tone === "danger" ? "text-2xl font-display font-bold text-destructive" : "text-2xl font-display font-bold"}>{value}</p>
    </Card>
  );
}

export default function Home() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const { current } = useCurrentDairy();
  const { data: entries = [] } = useEntries(current?.id);
  const { data: payments = [] } = usePayments(current?.id);
  const s = summarise(entries, payments, month);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month"><ChevronLeft className="w-4 h-4" /></Button>
        <p className="font-display font-semibold">{monthLabel(month)}</p>
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month"><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <Card className="p-5 bg-primary text-primary-foreground border-0">
        <p className="text-sm opacity-90">{current?.name} · इस महीने बकाया</p>
        <p className="text-4xl font-display font-extrabold mt-1">{inr(s.balance)}</p>
        <p className="text-xs opacity-90 mt-2">Bill {inr(s.bill)} · Paid {inr(s.paid)}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={CalendarCheck} label="Milk days · दूध लिया" value={String(s.takenDays)} tone="primary" />
        <Stat icon={CalendarX} label="No milk · नहीं लिया" value={String(s.noMilkDays)} />
        <Stat icon={Droplets} label="Total litres" value={`${s.litres} L`} />
        <Stat icon={IndianRupee} label="Total bill" value={inr(s.bill)} />
        <Stat icon={Wallet} label="Total paid" value={inr(s.paid)} tone="primary" />
        <Stat icon={Scale} label="Balance" value={inr(s.balance)} tone="danger" />
      </div>

      <Card className="p-4 space-y-2">
        <p className="font-semibold">Monthly summary</p>
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-y-1">
          <span>Total days</span><span className="text-right text-foreground font-medium">{s.totalDays}</span>
          <span>Entries filled</span><span className="text-right text-foreground font-medium">{s.entries.length}</span>
          <span>Payments made</span><span className="text-right text-foreground font-medium">{s.payments.length}</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild size="lg"><Link to="/add">+ आज की entry</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/payments">Add payment</Link></Button>
      </div>
    </div>
  );
}
