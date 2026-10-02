import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import EntryWizard from "@/components/EntryWizard";
import { entryAmount, inr, monthKey, monthLabel, shiftMonth, summarise, useEntries, usePayments } from "@/lib/milk/data";
import { useCurrentDairy } from "@/lib/milk/useCurrentDairy";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarPage() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const [date, setDate] = useState<string | null>(null);
  const { current } = useCurrentDairy();
  const { data: entries = [] } = useEntries(current?.id);
  const { data: payments = [] } = usePayments(current?.id);
  const s = summarise(entries, payments, month);

  const [y, m] = month.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [...Array.from({ length: firstDay }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const iso = (d: number) => `${month}-${String(d).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month"><ChevronLeft className="w-4 h-4" /></Button>
        <p className="font-display font-semibold">{monthLabel(month)}</p>
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month"><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-2">{WEEK.map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const e = entries.find((x) => x.entry_date === iso(d));
            return (
              <button key={i} onClick={() => setDate(iso(d))}
                className={cn("aspect-square rounded-xl border text-sm flex flex-col items-center justify-center gap-0.5 transition-colors",
                  e?.taken ? "bg-primary/10 border-primary/40" : e ? "bg-destructive/10 border-destructive/30" : "border-border hover:bg-muted")}>
                <span className="font-medium">{d}</span>
                <span className="text-[9px] leading-none">{e ? (e.taken ? `${e.litres}L` : "❌") : "·"}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 text-sm grid grid-cols-2 gap-y-1">
        <span className="text-muted-foreground">Milk days</span><span className="text-right font-semibold">{s.takenDays}</span>
        <span className="text-muted-foreground">No-milk days</span><span className="text-right font-semibold">{s.noMilkDays}</span>
        <span className="text-muted-foreground">Total litres</span><span className="text-right font-semibold">{s.litres} L</span>
        <span className="text-muted-foreground">Month bill</span><span className="text-right font-semibold">{inr(s.entries.reduce((a, e) => a + entryAmount(e), 0))}</span>
      </Card>

      <p className="text-xs text-muted-foreground text-center">Date pe tap karein — popup me entry bharein.</p>

      {current && date && (
        <EntryWizard open={!!date} onOpenChange={(v) => !v && setDate(null)} dairy={current} date={date}
          existing={entries.find((e) => e.entry_date === date)} />
      )}
    </div>
  );
}
