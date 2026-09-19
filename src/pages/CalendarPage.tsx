import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { inr, monthKey, monthLabel, shiftMonth, useEntries, useMonthSummary } from "@/lib/milk/store";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarPage() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const { entries } = useEntries();
  const s = useMonthSummary(month);
  const navigate = useNavigate();

  const [y, m] = month.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  const iso = (d: number) => `${month}-${String(d).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="font-display font-semibold">{monthLabel(month)}</p>
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-2">
          {WEEK.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const entry = entries.find((e) => e.date === iso(d));
            return (
              <button
                key={i}
                onClick={() => navigate(`/add/${iso(d)}`)}
                className={cn(
                  "aspect-square rounded-xl border text-sm flex flex-col items-center justify-center gap-0.5 transition-colors",
                  entry?.taken
                    ? "bg-primary/10 border-primary/40 text-foreground"
                    : entry
                      ? "bg-destructive/10 border-destructive/30"
                      : "border-border hover:bg-muted",
                )}
              >
                <span className="font-medium">{d}</span>
                <span className="text-[10px] leading-none">{entry ? (entry.taken ? "✅" : "❌") : "·"}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 text-sm grid grid-cols-2 gap-y-1">
        <span className="text-muted-foreground">Milk days</span>
        <span className="text-right font-semibold">{s.takenDays}</span>
        <span className="text-muted-foreground">No-milk days</span>
        <span className="text-right font-semibold">{s.noMilkDays}</span>
        <span className="text-muted-foreground">Total litres</span>
        <span className="text-right font-semibold">{s.litres} L</span>
        <span className="text-muted-foreground">Total bill</span>
        <span className="text-right font-semibold">{inr(s.bill)}</span>
      </Card>

      <p className="text-xs text-muted-foreground text-center">Tap a date to add or edit that day&apos;s entry.</p>
    </div>
  );
}
